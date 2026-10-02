import { NextRequest } from "next/server";
import { getWishlistController, addToWishlistController } from "@/controllers/wishlist.controller";

export async function GET() {
    return getWishlistController();
}

export async function POST(req: NextRequest) {
    return addToWishlistController(req);
}