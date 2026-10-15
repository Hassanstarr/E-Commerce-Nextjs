import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { createOrderController, getMyOrdersController } from "@/controllers/order.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.general,
        "Too many requests. Please wait a moment before viewing your orders again."
    );

    if (blocked) return blocked;

    await connectDB();
    return getMyOrdersController(req);
}

export async function POST(req: NextRequest) {

    const blocked = await enforceRateLimit(
        req,
        rateLimiters.checkout,
        "You've placed requests too quickly. Please wait a moment before trying checkout again."
    );

    if (blocked) return blocked;

    await connectDB();
    return createOrderController(req);
}