import { NextRequest } from "next/server";
import { forgotPasswordSchema, verifyPasswordResetSchema, resetPasswordSchema } from "@/lib/validations";
import { requestPasswordReset, verifyPasswordReset, resetPassword } from "@/services/password-reset.service";
import { connectDB } from "@/lib/db";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

export async function passwordResetController(req: NextRequest, action: "request" | "verify" | "reset") {
    try {
        if (req.headers.get("origin") !== req.nextUrl.origin) {
            return errorResponse("Invalid password reset request", 403);
        }

        const body = await req.json().catch(() => null);
        const schema = action === "request" ? forgotPasswordSchema
            : action === "verify" ? verifyPasswordResetSchema : resetPasswordSchema;
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return errorResponse(validation.error.issues[0]?.message || "Invalid request", 400);
        }

        await connectDB();
        let response;

        if (action === "request") {
            await requestPasswordReset(validation.data.email);
            response = successResponse(null, "If an account exists with this email, a reset code has been sent. Check your inbox and spam folder.");
        } else if (action === "verify") {
            const data = verifyPasswordResetSchema.parse(validation.data);
            response = successResponse(await verifyPasswordReset(data.email, data.otp), "Email verified. Choose a new password.");
        } else {
            const data = resetPasswordSchema.parse(validation.data);
            await resetPassword(data.email, data.token, data.password);
            response = successResponse(null, "Password reset successfully. Log in with your new password.");
            response.cookies.set("auth_token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 0,
                path: "/",
            });
        }

        response.headers.set("Cache-Control", "private, no-store");
        return response;
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Password reset error:", error);
        return errorResponse("Unable to reset password. Please try again later.");
    }
}
