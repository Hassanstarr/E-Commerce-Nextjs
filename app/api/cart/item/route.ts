import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { updateCartController, removeFromCartController } from "@/controllers/cart.controller";

export async function PUT(req: NextRequest) {
    await connectDB();
    return updateCartController(req);
}

export async function DELETE(req: NextRequest) {
    await connectDB();
    return removeFromCartController(req);
}