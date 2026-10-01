import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getCategoryController, updateCategoryController, deleteCategoryController } from "@/controllers/category.controller";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET( req: NextRequest, context: RouteContext ) {
    await connectDB();

    const { id } = await context.params;

    return getCategoryController(id);
}

export async function PUT( req: NextRequest, context: RouteContext ) {
    await connectDB();

    const { id } = await context.params;

    return updateCategoryController(req, id);
}

export async function DELETE( req: NextRequest, context: RouteContext ) {
    await connectDB();

    const { id } = await context.params;

    return deleteCategoryController(id);
}