import { NextRequest } from "next/server";
import { updateAccountController } from "@/controllers/account.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function PATCH(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.accountUpdate);
    if (blocked) return blocked;

    return updateAccountController(req, "profile");
}
