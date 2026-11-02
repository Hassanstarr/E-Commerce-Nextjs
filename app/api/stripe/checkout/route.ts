import { validationResponse } from "@/lib/validation-response";
import { readJson } from "@/lib/request-body";
import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations";
import { requireAuth } from "@/middleware/auth";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { isCheckoutEmailVerified } from "@/services/email-verification.service";
import { createStripeCheckout } from "@/services/stripe.service";

const stripeCheckoutSchema = checkoutSchema.extend({
    paymentMethod: z.literal("stripe"),
    requestId: z.string().uuid("Invalid payment request"),
});

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.checkout);
    if (blocked) return blocked;

    try {
        const user = await requireAuth();
        const validation = stripeCheckoutSchema.safeParse(await readJson(req));
        if (!validation.success) return validationResponse(validation.error);

        await connectDB();
        if (!await isCheckoutEmailVerified(user.userId, validation.data.customerEmail)) {
            return errorResponse("Please verify your email before paying", 400);
        }

        const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, "");
        const result = await createStripeCheckout(user.userId, validation.data, validation.data.requestId, appUrl);
        return successResponse(result, "Stripe checkout ready");
    } catch (error) {
        if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
        console.error("Stripe checkout error:", error);
        return errorResponse("Unable to start Stripe payment. Please try again.", 500);
    }
}
