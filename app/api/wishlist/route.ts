import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getWishlistController, addToWishlistController } from "@/controllers/wishlist.controller";

export async function GET() {
    await connectDB();
    return getWishlistController();
}

export async function POST(req: NextRequest) {
    await connectDB();
    return addToWishlistController(req);
}