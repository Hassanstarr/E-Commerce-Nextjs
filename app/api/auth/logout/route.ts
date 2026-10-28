import { NextRequest } from "next/server";
import { logoutController } from "@/controllers/auth.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";
import { revokeNotificationSession } from "@/services/notification-auth.service";
import { waitUntil } from "@vercel/functions";

export async function POST(req: NextRequest) {
    const blocked = await enforceRateLimit(
        req,
        rateLimiters.logout,
        "Too many requests. Please wait a minute and try again."
    );

    if (blocked) return blocked;

    const token = req.cookies.get("auth_token")?.value;
    if (token) {
        const revocation = revokeNotificationSession(token);
        try { waitUntil(revocation); } catch { /* Local server completes the same promise. */ }
    }
    return logoutController();
}
