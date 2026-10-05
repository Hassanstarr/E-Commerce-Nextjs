import { NextRequest } from "next/server";
import { createOrderController } from "@/controllers/order.controller";

export async function POST(req: NextRequest) {
    return createOrderController(req);
}