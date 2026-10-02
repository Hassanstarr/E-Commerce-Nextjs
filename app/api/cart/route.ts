import { NextRequest } from "next/server";
import { getCartController, addToCartController, clearCartController} from "@/controllers/cart.controller";

export async function GET() {
    return getCartController();
}

export async function POST(req: NextRequest) {
    return addToCartController(req);
}

export async function DELETE() {
    return clearCartController();
}