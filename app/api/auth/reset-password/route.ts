import { NextRequest } from "next/server";
import { passwordResetController } from "@/controllers/password-reset.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.passwordReset,
        "Too many password reset attempts. Please wait 10 minutes before trying again."
    );

    if (blocked) return blocked;

    return passwordResetController(req, "reset");
}
