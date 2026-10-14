import { NextRequest } from "next/server";
import { logoutController } from "@/controllers/auth.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.logout,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    return logoutController();
}