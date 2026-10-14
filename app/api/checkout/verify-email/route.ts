import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { enforceRateLimit } from "@/lib/enforce-rate-limit";
import { rateLimiters } from "@/lib/rate-limit";
import { verifyCheckoutEmail } from "@/services/email-verification.service";

const verificationSchema = z.object({
    email: z.string().trim().email("Please enter a valid email address"),
    otp: z.string().trim().regex(/^\d{6}$/, "Please enter the 6-digit OTP").optional(),
});

export async function POST(req: NextRequest) {
    try {
        const blocked = await enforceRateLimit(req, rateLimiters.emailVerification);

        if (blocked) return blocked;

        const user = await requireAuth();
        const validation = verificationSchema.safeParse(await req.json());

        if (!validation.success) {
            return errorResponse(
                validation.error.issues.map((issue) => issue.message).join(", "),
                400
            );
        }

        await connectDB();

        const result = await verifyCheckoutEmail(
            user.userId,
            validation.data.email,
            validation.data.otp
        );

        return successResponse(
            result,
            result.verified ? "Email verified" : "OTP sent to your email. It expires in 10 minutes."
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Email verification error:", error);
        return errorResponse("Unable to verify email", 500);
    }
}
