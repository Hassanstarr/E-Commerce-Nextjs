import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";

import { adminActivityController } from "@/controllers/admin.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET( req: NextRequest ) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.adminRead,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    await connectDB();

    return adminActivityController(req);
}