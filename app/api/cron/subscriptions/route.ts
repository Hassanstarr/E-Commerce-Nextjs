import { timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { sendSubscriptionEmails } from "@/services/subscription.service";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return errorResponse("Subscription scheduler is not configured.", 503);
    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(req.headers.get("authorization") || "");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
        return errorResponse("Unauthorized", 401);
    }
    try {
        await connectDB();
        const response = successResponse(await sendSubscriptionEmails(), "Subscription emails processed.");
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
        console.error("Subscription scheduler failed:", error);
        return errorResponse("Unable to process subscription emails.");
    }
}
