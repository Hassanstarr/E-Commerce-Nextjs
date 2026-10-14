import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";

import { adminCustomerDetailsController } from "@/controllers/admin.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET( req: NextRequest, context: RouteContext ) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.adminRead,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();

    const { id } = await context.params;

    return adminCustomerDetailsController(req, id);
}