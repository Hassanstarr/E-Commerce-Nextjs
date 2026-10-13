import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { createOrderController } from "@/controllers/order.controller";

export async function POST(req: NextRequest) {
    await connectDB();
    return createOrderController(req);
}