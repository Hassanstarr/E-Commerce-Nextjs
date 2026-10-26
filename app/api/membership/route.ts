import { NextRequest } from "next/server";
import { membershipController } from "@/controllers/membership.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.general);
    if (blocked) return blocked;
    return membershipController(req);
}

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.accountUpdate);
    if (blocked) return blocked;
    return membershipController(req, true);
}
