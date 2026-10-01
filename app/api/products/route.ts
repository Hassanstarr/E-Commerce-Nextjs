import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { createProductController, getProductsController } from "@/controllers/product.controller";

export async function GET(req: NextRequest) {
    await connectDB();

    return getProductsController(req);
}

export async function POST(req: NextRequest) {
    await connectDB();

    return createProductController(req);
}