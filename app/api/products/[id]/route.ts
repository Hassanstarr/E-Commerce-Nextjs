import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getProductController, updateProductController, deleteProductController } from "@/controllers/product.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET( req: NextRequest, context: RouteContext ) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.general,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();

    const { id } = await context.params;

    return getProductController(id);
}

export async function PUT( req: NextRequest, context: RouteContext ) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.adminMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();

    const { id } = await context.params;

    return updateProductController(req, id);
}

export async function DELETE( req: NextRequest, context: RouteContext ) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.adminMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();

    const { id } = await context.params;

    return deleteProductController(id);
}