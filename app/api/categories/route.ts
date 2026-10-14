import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { createCategoryController, getCategoriesController } from "@/controllers/category.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.general,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();

    return getCategoriesController();
}

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.adminMutation,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();

    return createCategoryController(req);
}