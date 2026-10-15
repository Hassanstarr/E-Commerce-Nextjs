import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import { applyStripePayment } from "@/services/stripe.service";

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

    if (!["payment_intent.succeeded", "payment_intent.canceled", "payment_intent.payment_failed"].includes(event.type)) {
        return successResponse({ received: true });
    }

    try {
        const eventIntent = event.data.object as Stripe.PaymentIntent;
        if (!eventIntent.metadata.checkoutId) return successResponse({ received: true });
        // Fetch current state so delayed failure events cannot override a successful payment.
        const intent = await getStripe().paymentIntents.retrieve(eventIntent.id);
        await connectDB();
        await applyStripePayment(intent);
        return successResponse({ received: true });
    } catch (error) {
        console.error("Stripe webhook error:", error);
        return errorResponse("Unable to process Stripe webhook", 500);
    }
}
