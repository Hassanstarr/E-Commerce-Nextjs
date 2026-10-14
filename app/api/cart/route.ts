import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getCartController, addToCartController, clearCartController} from "@/controllers/cart.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.general,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();
    return getCartController();
}

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.cartMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();
    return addToCartController(req);
}

export async function DELETE(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.cartMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();
    return clearCartController();
}