import { NextRequest } from "next/server";
import { signupSchema, loginSchema } from "@/lib/validations";
import { signupUser, loginUser } from "@/services/auth.service";
import { createToken } from "@/lib/auth";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { getCurrentUser } from "@/services/auth.service";
import { requireAuth } from "@/middleware/auth";
import { requireAdmin } from "@/middleware/auth";

export async function signupController(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = signupSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(
                "Validation failed",
                400,
                validation.error.flatten().fieldErrors
            );
        }

        const user = await signupUser(validation.data);

        const token = await createToken(user.id, user.role);

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

        const token = await createToken(user.id, user.role);

        const response = successResponse(
            {
                user,
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

export async function adminTestController() {
    try {
        const admin = await requireAdmin();

        return successResponse(
            {
                userId: admin.userId,
                role: admin.role,
            },
            "Admin access granted"
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Admin authorization error:", error);

        return errorResponse("Unable to verify admin access");
    }
}