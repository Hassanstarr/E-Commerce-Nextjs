import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getProductController, updateProductController, deleteProductController } from "@/controllers/product.controller";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    await connectDB();

    const { id } = await context.params;

    return getProductController(id);
}

export async function PUT(
    req: NextRequest,
    context: RouteContext
) {
    await connectDB();

    const { id } = await context.params;

    return updateProductController(req, id);
}

export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    await connectDB();

    const { id } = await context.params;

    return deleteProductController(id);
}