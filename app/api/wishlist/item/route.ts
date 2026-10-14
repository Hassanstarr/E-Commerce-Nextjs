import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { removeFromWishlistController } from "@/controllers/wishlist.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function DELETE(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.wishlistMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();
    return removeFromWishlistController(req);
}