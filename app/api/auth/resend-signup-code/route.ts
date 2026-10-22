import { NextRequest } from "next/server";
import { signupController } from "@/controllers/auth.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.signupResend, "Too many registration emails. Please wait 10 minutes and try again.");
    if (blocked) return blocked;
    return signupController(req, "resend");
}
