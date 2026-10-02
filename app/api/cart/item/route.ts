import { NextRequest } from "next/server";
import { updateCartController, removeFromCartController } from "@/controllers/cart.controller";

export async function PUT(req: NextRequest) {
    return updateCartController(req);
}

export async function DELETE(req: NextRequest) {
    return removeFromCartController(req);
}