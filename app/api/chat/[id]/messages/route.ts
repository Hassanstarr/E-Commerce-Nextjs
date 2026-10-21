import { NextRequest } from "next/server";
import { chatController } from "@/controllers/chat.controller";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const blocked = await enforceRateLimit(req, rateLimiters.chatRead);
    if (blocked) return blocked;
    const { id } = await context.params;

    return chatController(req, "messages", id);
}
