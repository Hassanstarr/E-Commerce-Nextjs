import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { removeFromWishlistController } from "@/controllers/wishlist.controller";

export async function DELETE(req: NextRequest) {
    await connectDB();
    return removeFromWishlistController(req);
}