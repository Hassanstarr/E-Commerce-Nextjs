import { NextRequest } from "next/server";
import { subscriptionController } from "@/controllers/subscription.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.general);
    if (blocked) return blocked;
    return subscriptionController(req);
}

export async function PUT(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.accountUpdate);
    if (blocked) return blocked;
    return subscriptionController(req, true);
}
