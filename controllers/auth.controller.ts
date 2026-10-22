import { NextRequest } from "next/server";
import { signupSchema, verifySignupSchema, loginSchema } from "@/lib/validations";
import { signupUser, loginUser } from "@/services/auth.service";
import { createToken } from "@/lib/auth";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { getCurrentUser } from "@/services/auth.service";
import { requireAuth } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/admin";
import { connectDB } from "@/lib/db";

export async function signupController(req: NextRequest, action: "request" | "verify" | "resend" = "request") {
    try {
        if (req.headers.get("origin") !== req.nextUrl.origin) {
            return errorResponse("Invalid registration request", 403);
        }
        await connectDB();
        const challengeToken = req.cookies.get("signup_verification")?.value || "";
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/api/auth",
        };

        if (action === "request" || action === "resend") {
            const { requestSignup, resendSignupCode } = await import("@/services/signup-verification.service");
            let challenge;
            if (action === "request") {
                const validation = signupSchema.safeParse(await req.json().catch(() => null));
                if (!validation.success) return errorResponse(validation.error.issues[0].message, 400);
                challenge = await requestSignup(validation.data);
            } else {
                challenge = await resendSignupCode(challengeToken);
            }
            const response = successResponse({ email: challenge.email, resendAfter: challenge.resendAfter }, "Verification code sent. Check your inbox and spam folder.");
            response.headers.set("Cache-Control", "private, no-store");
            response.cookies.set("signup_verification", challenge.token, { ...cookieOptions, maxAge: 10 * 60 });
            return response;
        }

        const validation = verifySignupSchema.safeParse(await req.json().catch(() => null));
        if (!validation.success) return errorResponse(validation.error.issues[0].message, 400);
        const user = await signupUser(challengeToken, validation.data.otp);
        const token = await createToken(user.id, user.role, user.sessionVersion);

        const response = successResponse(
            {
                user,
            },
            "Account created successfully",
            201
        );

        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        response.cookies.set("signup_verification", "", { ...cookieOptions, maxAge: 0 });
        response.headers.set("Cache-Control", "private, no-store");

        return response;
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Signup error:", error);

        return errorResponse("Unable to create account");
    }
}

export async function loginController(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(
                "Validation failed",
                400,
                validation.error.flatten().fieldErrors
            );
        }

        const user = await loginUser(validation.data);

        const token = await createToken(user.id, user.role, user.sessionVersion);

        const redirectTo = user.role === "admin" ? "/admin" : "/";

        const response = successResponse(
            {
                user,
                redirectTo,
            },
            "Login successful"
        );

        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Login error:", error);

        return errorResponse("Unable to login");
    }
}

export async function logoutController() {
    const response = successResponse(
        null,
        "Logout successful"
    );

    response.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
    });

    return response;
}

export async function meController() {
    try {
        const authUser = await requireAuth();

        const user = await getCurrentUser(authUser.userId);

        return successResponse(
            {
                user,
            },
            "Authenticated user retrieved successfully"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Get current user error:", error);

        return errorResponse("Unable to get current user");
    }
}
