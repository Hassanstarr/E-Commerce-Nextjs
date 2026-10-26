import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/middleware/auth";
import { getMembership, createMembershipCheckout, cancelMembership } from "@/services/membership.service";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

export async function membershipController(req: NextRequest, update = false) {
    try {
        const user = await requireAuth();
        if (user.role === "admin") throw new AppError("Membership is available to customer accounts only.", 403);
        let result;
        if (update) {
            if (req.headers.get("origin") !== req.nextUrl.origin) throw new AppError("Invalid membership request.", 403);
            const validation = z.object({ action: z.enum(["checkout", "cancel"]) }).strict().safeParse(await req.json().catch(() => null));
            if (!validation.success) throw new AppError("Choose a valid membership action.", 400);
            if (validation.data.action === "checkout") {
                const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin);
                if (!["http:", "https:"].includes(appUrl.protocol) || (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:")) {
                    console.error("Membership checkout: configure a valid HTTPS application URL in production.");
                    throw new AppError("Membership checkout is temporarily unavailable. Please try again later.", 503);
                }
                result = await createMembershipCheckout(user.userId, appUrl.origin);
            } else {
                await cancelMembership(user.userId);
                result = { cancelled: true };
            }
        } else {
            const checkoutId = req.nextUrl.searchParams.get("checkout") || undefined;
            if (checkoutId && !/^cs_[a-zA-Z0-9_]{1,200}$/.test(checkoutId)) throw new AppError("Invalid membership checkout.", 400);
            result = await getMembership(user.userId, checkoutId);
        }
        const response = successResponse(result);
        response.headers.set("Cache-Control", "private, no-store");
        return response;
    } catch (error) {
        if (error instanceof AppError) return errorResponse(error.message, error.statusCode);
        console.error("Membership request failed:", error instanceof Error ? error.message : "Unknown error");
        return errorResponse("Unable to update membership. Please try again.", 503);
    }
}
