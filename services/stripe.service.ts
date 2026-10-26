import mongoose from "mongoose";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import AppError from "@/lib/AppError";
import StripeCheckout from "@/models/StripeCheckout";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import User from "@/models/User";
import { getUserRole } from "@/lib/membership";
import { sendOrderConfirmationEmail } from "@/services/order.service";
import type { CheckoutInput } from "@/types/order";
import { getProductPricing } from "@/lib/product-pricing";
import { expireProductDiscounts } from "@/services/discount.service";

export async function createStripeCheckout(userId: string, data: CheckoutInput, requestId: string, appUrl: string) {
    await expireProductDiscounts();
    const stripe = getStripe();
    const requestKey = `${userId}:${requestId}`;
    let checkout = await StripeCheckout.findOne({ requestKey });

    if (!checkout) {
        const user = await User.findById(userId).select("role memberUntil");
        if (!user) throw new AppError("User not found", 404);
        const role = getUserRole(user);
        const cart = await Cart.findOne({ user: userId });
        if (!cart || !cart.items.length) throw new AppError("Your cart is empty", 400);

        const products = await Product.find({ _id: { $in: cart.items.map((item) => item.product) } });
        const items = cart.items.map((item) => {
            const product = products.find((product) => product._id.toString() === item.product.toString());
            if (!product || product.stock < item.quantity) {
                throw new AppError("Some products are unavailable or do not have enough stock. Please update your cart.", 409);
            }
            return {
                product: product._id.toString(), name: product.name, image: product.image,
                price: getProductPricing(product, Date.now(), role).price, quantity: item.quantity,
            };
        });
        const subtotal = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
        const total = subtotal + 200;
        if (!Number.isSafeInteger(Math.round(total * 100)) || total * 100 > 99999999) {
            throw new AppError("This order exceeds the Stripe payment limit. Please use cash on delivery.", 400);
        }

        try {
            checkout = await StripeCheckout.create({
                user: userId,
                requestKey,
                orderData: {
                    customerName: data.customerName, customerEmail: data.customerEmail.trim().toLowerCase(),
                    phone: data.phone,
                    shippingAddress: { address: data.address, city: data.city, postalCode: data.postalCode },
                    paymentMethod: "stripe", items, subtotal, deliveryFee: 200, total,
                },
            });
        } catch (error) {
            if (!(error instanceof mongoose.mongo.MongoServerError) || error.code !== 11000) throw error;
            checkout = await StripeCheckout.findOne({ requestKey });
        }
    }

    if (!checkout) throw new AppError("Unable to start Stripe checkout", 500);

    if (checkout.stripeSessionId) {
        const existing = await stripe.checkout.sessions.retrieve(checkout.stripeSessionId);
        return { url: existing.status === "open" && existing.url ? existing.url : `${appUrl}/checkout/stripe/${checkout._id}` };
    }

    const stripeSession = await stripe.checkout.sessions.create({
        mode: "payment",
        allowed_payment_method_types: ["card"],
        customer_email: checkout.orderData.customerEmail,
        client_reference_id: checkout._id.toString(),
        payment_intent_data: { metadata: { checkoutId: checkout._id.toString(), userId } },
        line_items: [
            ...checkout.orderData.items.map((item) => ({
                price_data: { currency: "pkr", product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
                quantity: item.quantity,
            })),
            { price_data: { currency: "pkr", product_data: { name: "Delivery" }, unit_amount: 20000 }, quantity: 1 },
        ],
        success_url: `${appUrl}/checkout/stripe/${checkout._id}`,
        cancel_url: `${appUrl}/checkout/stripe/${checkout._id}?canceled=1`,
    }, { idempotencyKey: `checkout-${checkout._id}` });

    await StripeCheckout.updateOne({ _id: checkout._id }, { $set: { stripeSessionId: stripeSession.id } });
    if (!stripeSession.url) throw new AppError("Unable to open Stripe checkout", 502);
    return { url: stripeSession.url };
}

async function refundCheckout(checkoutId: string, paymentIntentId: string) {
    await getStripe().refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey: `checkout-refund-${checkoutId}` });
    await StripeCheckout.updateOne({ _id: checkoutId, status: "refund_pending" }, { $set: { status: "refunded" } });
    return null;
}

export async function applyStripePayment(intent: Stripe.PaymentIntent) {
    const checkoutId = intent.metadata.checkoutId;
    if (!checkoutId || !mongoose.Types.ObjectId.isValid(checkoutId)) return null;
    const checkout = await StripeCheckout.findById(checkoutId);
    if (!checkout) return null;
    if (intent.metadata.userId !== checkout.user.toString() ||
        (checkout.paymentIntentId && checkout.paymentIntentId !== intent.id) ||
        intent.currency !== "pkr" || intent.amount !== Math.round(checkout.orderData.total * 100)) {
        throw new AppError("Stripe payment does not match this checkout", 400);
    }

    if (checkout.order) return checkout.order.toString();
    if (intent.status !== "succeeded") {
        if (intent.status === "canceled" || intent.status === "requires_payment_method") {
            await StripeCheckout.updateOne(
                { _id: checkoutId, status: { $in: ["pending", "failed", "canceled"] } },
                { $set: { status: intent.status === "canceled" ? "canceled" : "failed", paymentIntentId: intent.id } }
            );
        }
        return null;
    }
    if (intent.amount_received !== intent.amount) throw new AppError("Stripe payment amount is incomplete", 400);
    if (checkout.status === "refunded") return null;
    if (checkout.status === "refund_pending") return refundCheckout(checkoutId, intent.id);

    const session = await mongoose.startSession();
    let orderId: string | null = null;
    let created = false;
    try {
        await session.withTransaction(async () => {
            created = false;
            const current = await StripeCheckout.findById(checkoutId).session(session);
            if (!current) throw new AppError("Checkout not found", 404);
            if (current.order) { orderId = current.order.toString(); return; }
            if (["refund_pending", "refunded"].includes(current.status)) return;

            for (const item of current.orderData.items) {
                const product = await Product.findOneAndUpdate(
                    { _id: item.product, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { new: true, session }
                );
                if (!product) throw new AppError("A product became unavailable before payment completed", 409);
            }

            const [order] = await Order.create([{
                ...current.orderData, user: current.user,
                paymentMethod: "stripe", paymentStatus: "paid", orderStatus: "pending",
                stripePaymentIntentId: intent.id,
            }], { session });

            const cart = await Cart.findOne({ user: current.user }).session(session);
            if (cart) {
                cart.items = cart.items.map((item) => {
                    const purchased = current.orderData.items.find((paidItem) => paidItem.product.toString() === item.product.toString());
                    return { product: item.product, quantity: Math.max(0, item.quantity - (purchased?.quantity || 0)) };
                }).filter((item) => item.quantity > 0);
                await cart.save({ session });
            }

            current.order = order._id;
            current.status = "paid";
            current.paymentIntentId = intent.id;
            await current.save({ session });
            orderId = order._id.toString();
            created = true;
        });
    } catch (error) {
        if (!(error instanceof AppError) || error.statusCode !== 409) throw error;
        const refund = await StripeCheckout.findOneAndUpdate(
            { _id: checkoutId, order: { $exists: false }, status: { $nin: ["paid", "refunded"] } },
            { $set: { status: "refund_pending", paymentIntentId: intent.id } }
        );
        if (refund) return refundCheckout(checkoutId, intent.id);
        const completed = await StripeCheckout.findById(checkoutId);
        return completed?.order?.toString() || null;
    } finally {
        await session.endSession();
    }

    if (created && orderId) {
        try {
            const order = await Order.findById(orderId);
            if (order) await sendOrderConfirmationEmail(order);
        } catch (error) {
            console.error("Stripe order confirmation email failed:", error);
        }
    }
    return orderId;
}

export async function getStripeCheckoutStatus(userId: string, checkoutId: string, cancel = false) {
    if (!mongoose.Types.ObjectId.isValid(checkoutId)) throw new AppError("Invalid checkout ID", 400);
    let checkout = await StripeCheckout.findOne({ _id: checkoutId, user: userId });
    if (!checkout) throw new AppError("Checkout not found", 404);

    if (!checkout.order && checkout.stripeSessionId) {
        const stripeSession = await getStripe().checkout.sessions.retrieve(checkout.stripeSessionId, { expand: ["payment_intent"] });
        const intent = stripeSession.payment_intent;
        if (intent && typeof intent !== "string") await applyStripePayment(intent);

        if (cancel && stripeSession.status === "open") {
            try {
                await getStripe().checkout.sessions.expire(stripeSession.id);
            } catch {
                // Payment may have completed while the customer returned to checkout.
                const latest = await getStripe().checkout.sessions.retrieve(stripeSession.id, { expand: ["payment_intent"] });
                if (latest.status !== "complete") throw new AppError("Unable to cancel payment. Please try again.", 409);
                if (latest.payment_intent && typeof latest.payment_intent !== "string") await applyStripePayment(latest.payment_intent);
            }
        }
        if (stripeSession.status === "expired" || (cancel && stripeSession.status === "open")) {
            await StripeCheckout.updateOne(
                { _id: checkoutId, status: { $in: ["pending", "failed"] }, order: { $exists: false } },
                { $set: { status: "canceled" } }
            );
        }
        checkout = await StripeCheckout.findById(checkoutId);
    }

    return { status: checkout?.status || "pending", orderId: checkout?.order?.toString() || null };
}
