import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { updateCartController, removeFromCartController } from "@/controllers/cart.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.cartMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();
    return updateCartController(req);
}

export async function DELETE(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.cartMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();
    return removeFromCartController(req);
}