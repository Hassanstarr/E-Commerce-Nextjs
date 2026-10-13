import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getCartController, addToCartController, clearCartController} from "@/controllers/cart.controller";

export async function GET() {
    await connectDB();
    return getCartController();
}

export async function POST(req: NextRequest) {
    await connectDB();
    return addToCartController(req);
}

export async function DELETE() {
    await connectDB();
    return clearCartController();
}