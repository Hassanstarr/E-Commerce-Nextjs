import { NextRequest } from "next/server";
import { upgradeWebSocket } from "@vercel/functions";
import { getChatRuntime } from "@/websocket/chat-server";
import { getChatIdentity } from "@/services/chat.service";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
    if (req.headers.get("origin") !== req.nextUrl.origin) return errorResponse("Invalid chat origin", 403);
    const blocked = await enforceRateLimit(req, rateLimiters.chatConnection);
    if (blocked) return blocked;

    try {
        const token = req.cookies.get("auth_token")?.value || "";
        await getChatIdentity(token);
        return await upgradeWebSocket((socket) => getChatRuntime().attach(socket, token), { maxPayload: 16384 });
    } catch (error) {
        if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
        console.error("WebSocket upgrade failed:", error);
        return errorResponse("Live chat is temporarily unavailable.", 503);
    }
}
