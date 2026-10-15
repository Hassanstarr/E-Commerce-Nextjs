import Stripe from "stripe";
import AppError from "@/lib/AppError";

let stripe: Stripe | undefined;

export function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new AppError("Stripe payments are not configured", 503);
    }

    stripe ||= new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripe;
}
