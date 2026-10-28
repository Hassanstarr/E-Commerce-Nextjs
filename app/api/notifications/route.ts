import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { requireAuth } from "@/middleware/auth";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";
import { createNotificationSession } from "@/services/notification-auth.service";

export const runtime = "nodejs";
export const maxDuration = 300;

function failure(error: unknown) {
    if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
    console.error("Notification request failed; check Firebase configuration, database indexes and permissions.");
    return errorResponse("Unable to update notifications. Please try again shortly.", 503);
}

export async function GET(req: NextRequest) {
    const blocked = await enforceRateLimit(req, rateLimiters.notificationsRead);
    if (blocked) return blocked;
    try {
        const user = await requireAuth();
        const filter = req.nextUrl.searchParams.get("filter") || "all";
        const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
        if (!["all", "unread"].includes(filter) || (cursor && cursor.length > 300)) return errorResponse("Invalid notification filter or page", 400);
        const response = successResponse(await getNotifications(user.userId, filter === "unread" ? "unread" : "all", cursor));
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) { return failure(error); }
}

export async function POST(req: NextRequest) {
    if (req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) return errorResponse("Invalid request origin", 403);
    const blocked = await enforceRateLimit(req, rateLimiters.notificationsWrite);
    if (blocked) return blocked;
    try {
        const user = await requireAuth();
        const body = await req.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("Invalid notification request", 400);
        if (body.action === "connect") {
            const token = (await cookies()).get("auth_token")?.value;
            if (!token) return errorResponse("Authentication required", 401);
            const response = successResponse(await createNotificationSession(user.userId, token));
            response.headers.set("Cache-Control", "no-store");
            return response;
        }
        if (body.action === "read-all") await markAllNotificationsRead(user.userId);
        else if (body.action === "read" && typeof body.id === "string") await markNotificationRead(user.userId, body.id);
        else return errorResponse("Invalid notification action", 400);
        return successResponse(null, "Notifications updated");
    } catch (error) {
        if (error instanceof SyntaxError) return errorResponse("Invalid notification request", 400);
        return failure(error);
    }
}
