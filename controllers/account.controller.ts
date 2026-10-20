import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { accountProfileSchema, changePasswordSchema } from "@/lib/validations";
import { updateAccountProfile, changeAccountPassword } from "@/services/account.service";
import { createToken } from "@/lib/auth";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

export async function updateAccountController(req: NextRequest, action: "profile" | "password") {
    try {
        if (req.headers.get("origin") !== req.nextUrl.origin) {
            return errorResponse("Invalid account update request", 403);
        }

        const authUser = await requireAuth();
        const body = await req.json().catch(() => null);
        let response;

        if (action === "profile") {
            const validation = accountProfileSchema.safeParse(body);
            if (!validation.success) {
                return errorResponse(validation.error.issues[0]?.message || "Invalid name", 400);
            }

            const profile = await updateAccountProfile(authUser.userId, validation.data.name);
            response = successResponse(profile, "Your name has been updated.");
        } else {
            const validation = changePasswordSchema.safeParse(body);
            if (!validation.success) {
                return errorResponse(validation.error.issues[0]?.message || "Invalid password", 400);
            }

            const user = await changeAccountPassword(
                authUser.userId,
                authUser.sessionVersion,
                validation.data.currentPassword,
                validation.data.newPassword
            );
            const token = await createToken(user.id, user.role, user.sessionVersion);
            response = successResponse(null, "Password updated. Other sessions have been signed out.");
            response.cookies.set("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            });
        }

        response.headers.set("Cache-Control", "private, no-store");
        return response;
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Account update error:", error);
        return errorResponse("Unable to update your account. Please try again.");
    }
}
