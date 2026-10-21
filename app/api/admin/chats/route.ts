import { NextRequest } from "next/server";
import { chatController } from "@/controllers/chat.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.chatRead);
    if (blocked) return blocked;

    return chatController(req, "inbox");
}
