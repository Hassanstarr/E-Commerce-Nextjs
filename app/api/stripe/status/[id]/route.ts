import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { getStripeCheckoutStatus } from "@/services/stripe.service";

type RouteContext = { params: Promise<{ id: string }> };

async function checkoutStatus(req: NextRequest, context: RouteContext, cancel: boolean) {
    const blocked = await enforceRateLimit(req, rateLimiters.general);
    if (blocked) return blocked;

    try {
        const action = req.nextUrl.searchParams.get("action");
        if (action && (!cancel || action !== "retry-refund")) throw new AppError("Invalid checkout action", 400);
        if (cancel && req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) throw new AppError("Invalid checkout request", 403);
        const user = await requireAuth();
        const { id } = await context.params;
        await connectDB();
        return successResponse(await getStripeCheckoutStatus(user.userId, id, cancel && !action, action === "retry-refund"));
    } catch (error) {
        if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
        console.error("Stripe payment status error:", error);
        return errorResponse("Unable to check payment. Please try again.", 500);
    }
}

export async function GET(req: NextRequest, context: RouteContext) {
    return checkoutStatus(req, context, false);
}

export async function POST(req: NextRequest, context: RouteContext) {
    return checkoutStatus(req, context, true);
}
