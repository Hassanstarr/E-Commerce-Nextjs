import { NextRequest } from "next/server";
import { z } from "zod";
import { getChatIdentity, getMyConversation, getChatMessages, listChatConversations, markChatRead, initializeChat } from "@/services/chat.service";
import { chatReadSchema } from "@/lib/chat-validation";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

const positiveInteger = z.coerce.number().int().min(1).max(1000000);

export async function chatController(req: NextRequest, action: "mine" | "inbox" | "messages" | "read", id = "") {
    try {
        if (action === "read" && req.headers.get("origin") !== req.nextUrl.origin) {
            return errorResponse("Invalid chat request", 403);
        }
        const identity = await getChatIdentity(req.cookies.get("auth_token")?.value || "");
        if (action === "inbox" && identity.role !== "admin") throw new AppError("Admin access required", 403);
        await initializeChat();
        let data;

        if (action === "mine") {
            const conversation = await getMyConversation(identity);
            if (!conversation) throw new AppError("Conversation not found", 404);
            data = { conversationId: conversation._id.toString() };
        } else if (action === "inbox") {
            const page = positiveInteger.safeParse(req.nextUrl.searchParams.get("page") || "1");
            if (!page.success) return errorResponse("Invalid page number", 400);
            const search = (req.nextUrl.searchParams.get("search") || "").trim();
            if (search.length > 100) return errorResponse("Search cannot exceed 100 characters", 400);
            data = await listChatConversations(page.data, search, req.nextUrl.searchParams.get("filter") === "unread");
        } else if (action === "messages") {
            const beforeValue = req.nextUrl.searchParams.get("before");
            const before = beforeValue ? z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER).safeParse(beforeValue) : null;
            if (before && !before.success) return errorResponse("Invalid message cursor", 400);
            data = await getChatMessages(identity, id, before?.success ? before.data : undefined);
        } else {
            const validation = chatReadSchema.safeParse(await req.json().catch(() => null));
            if (!validation.success) return errorResponse("Invalid read position", 400);
            await markChatRead(identity, id, validation.data.sequence);
            data = null;
        }

        const response = successResponse(data);
        response.headers.set("Cache-Control", "private, no-store");
        return response;
    } catch (error) {
        if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
        console.error("Chat request failed:", error);
        return errorResponse("Unable to load chat. Please try again.");
    }
}
