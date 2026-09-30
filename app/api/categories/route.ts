import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { createCategoryController, getCategoriesController } from "@/controllers/category.controller";

export async function GET() {
    await connectDB();

    return getCategoriesController();
}

export async function POST(req: NextRequest) {
    await connectDB();

    return createCategoryController(req);
}