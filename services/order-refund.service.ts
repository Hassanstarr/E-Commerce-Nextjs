import Order from "@/models/Order";
import OrderHistory from "@/models/OrderHistory";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";
import { getStripe } from "@/lib/stripe";
import AppError from "@/lib/AppError";
import { queueNotification, dispatchNotifications } from "./notification-event.service";

// Stripe runs outside the MongoDB transaction. The stored pending state makes retries safe.
export async function refundAdminOrder(orderId: string, changedBy?: string, allowCreate = true) {
    const order = await Order.findById(orderId).lean();
    const eligibleStatuses: Array<"paid" | "refund_pending" | "refunded"> = allowCreate ? ["paid", "refund_pending"] : ["paid", "refund_pending", "refunded"];
    if (!order || order.orderStatus !== "cancelled" || order.paymentMethod !== "stripe" || order.paymentStatus === "pending" || !eligibleStatuses.includes(order.paymentStatus)) return;
    if (!order.stripePaymentIntentId) throw new AppError("The order is cancelled, but its Stripe payment reference is missing. Review the payment in Stripe before refunding.", 409);

    const stripe = getStripe();
    const refunds = await stripe.refunds.list({ payment_intent: order.stripePaymentIntentId, limit: 100 });
    const amount = Math.round(order.total * 100);
    const refunded = refunds.data.filter((refund) => refund.status === "succeeded").reduce((sum, refund) => sum + refund.amount, 0);
    let refund = refunds.data.find((refund) => refund.id === order.stripeRefundId || refund.metadata?.orderId === orderId);
    let completed = refunded === amount;

    if (!completed) {
        if (refunded > 0 || refunds.has_more) throw new AppError("This payment has partial refunds. Complete and review the full refund in Stripe, then check again.", 409);
        if (!refund && !allowCreate) return;
        if (allowCreate && (!refund || refund.status === "failed" || refund.status === "canceled")) {
            if (refunds.data.some((item) => item.status === "pending" || item.status === "requires_action")) throw new AppError("A refund is already processing in Stripe. Review it before retrying.", 409);
            refund = await stripe.refunds.create({
                payment_intent: order.stripePaymentIntentId, amount, metadata: { orderId },
            }, { idempotencyKey: `order-refund-${orderId}-${refund?.id || "initial"}` });
        }
        completed = refund?.status === "succeeded";
    }

    const paymentStatus: "refunded" | "refund_pending" = completed ? "refunded" : "refund_pending";
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const updated = await Order.findOneAndUpdate({
                _id: orderId, orderStatus: "cancelled", paymentMethod: "stripe", paymentStatus: order.paymentStatus, updatedAt: order.updatedAt,
            }, { $set: { paymentStatus, ...(refund ? { stripeRefundId: refund.id } : {}) } }, { new: false, session });
            if (!updated || updated.paymentStatus === paymentStatus) return;
            await OrderHistory.create([{ order: orderId, status: "cancelled", changedBy,
                note: completed ? "Stripe confirmed the full payment refund." : "Stripe refund is processing." }], { session });
            await ActivityLog.create([{ user: changedBy, action: "update_payment_status", entityType: "order", entityId: orderId,
                description: `Order payment status changed from ${updated.paymentStatus} to ${paymentStatus}` }], { session });
            await queueNotification({ key: `order:${orderId}:refund:${paymentStatus}`, type: "payment", audience: "user", userId: order.user.toString(),
                title: completed ? "Payment refunded" : "Refund processing", message: completed ? "Your cancelled order has been refunded to your card." : "Your cancelled order refund is processing.", href: "/orders" }, session);
        });
    } finally {
        await session.endSession();
    }
    dispatchNotifications();
    if (allowCreate && (refund?.status === "failed" || refund?.status === "canceled")) throw new AppError("Stripe could not complete the refund. Review the payment and retry.", 409);
}
