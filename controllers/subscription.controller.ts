import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { subscriptionSchema } from "@/lib/subscription";
import { getSubscription, saveSubscription } from "@/services/subscription.service";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

export async function subscriptionController(req: NextRequest, update = false) {
    try {
        if (update && req.headers.get("origin") !== req.nextUrl.origin) {
            return errorResponse("Invalid subscription update request", 403);
        }
        const user = await requireAuth();
        let response;
        if (update) {
            const validation = subscriptionSchema.safeParse(await req.json().catch(() => null));
            if (!validation.success) return errorResponse(validation.error.issues[0].message, 400);
            const preferences = await saveSubscription(user.userId, validation.data);
            response = successResponse({ preferences }, "Your email preferences have been saved.");
        } else {
            response = successResponse(await getSubscription(user.userId), "Subscription preferences retrieved.");
        }
        response.headers.set("Cache-Control", "private, no-store");
        return response;
    } catch (error) {
        if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
        console.error("Subscription error:", error);
        return errorResponse("Unable to update subscription preferences. Please try again.");
    }
}
