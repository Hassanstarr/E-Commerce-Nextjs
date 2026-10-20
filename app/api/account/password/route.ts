import { NextRequest } from "next/server";
import { updateAccountController } from "@/controllers/account.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function PUT(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.passwordChange,
        "Too many password change attempts. Please wait 10 minutes before trying again."
    );
    if (blocked) return blocked;

    return updateAccountController(req, "password");
}
