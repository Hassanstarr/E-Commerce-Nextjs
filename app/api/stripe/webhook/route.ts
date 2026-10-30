import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import { applyStripePayment } from "@/services/stripe.service";
import { handleMembershipEvent } from "@/services/membership.service";
import Order from "@/models/Order";
import { refundAdminOrder } from "@/services/order-refund.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const signature = req.headers.get("stripe-signature");
    if (!signature) return errorResponse("Missing Stripe signature", 400);
    if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
        return errorResponse("Stripe webhook is not configured", 503);
    }

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(await req.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
        return errorResponse("Invalid Stripe signature", 400);
    }

    try {
        await connectDB();
        if (["refund.updated", "refund.created", "refund.failed"].includes(event.type)) {
            const refund = event.data.object as Stripe.Refund;
            const intentId = typeof refund.payment_intent === "string" ? refund.payment_intent : refund.payment_intent?.id;
            const order = intentId && await Order.findOne({ stripePaymentIntentId: intentId, orderStatus: "cancelled", paymentStatus: { $in: ["paid", "refund_pending", "refunded"] } }).select("_id");
            if (order) await refundAdminOrder(order._id.toString(), undefined, false);
            return successResponse({ received: true });
        }
        if (await handleMembershipEvent(event)) return successResponse({ received: true });
        if (!["payment_intent.succeeded", "payment_intent.canceled", "payment_intent.payment_failed"].includes(event.type)) {
            return successResponse({ received: true });
        }
        const eventIntent = event.data.object as Stripe.PaymentIntent;
        if (!eventIntent.metadata.checkoutId) return successResponse({ received: true });
        // Fetch current state so delayed failure events cannot override a successful payment.
        const intent = await getStripe().paymentIntents.retrieve(eventIntent.id);
        await applyStripePayment(intent);
        return successResponse({ received: true });
    } catch (error) {
        console.error("Stripe webhook error:", error);
        return errorResponse("Unable to process Stripe webhook", 500);
    }
}
