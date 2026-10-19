import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { loginGoogleUser } from "@/services/google-auth.service";
import { createToken } from "@/lib/auth";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

const googleLoginSchema = z.object({
    credential: z.string().min(1).max(10000),
});

export function googleNonceController(req: NextRequest) {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        return errorResponse("Google sign-in is not configured", 503);
    }

    const existingNonce = req.cookies.get("google_auth_nonce")?.value;
    const nonce = existingNonce && /^[A-Za-z0-9_-]{43}$/.test(existingNonce)
        ? existingNonce
        : randomBytes(32).toString("base64url");
    const response = successResponse({ nonce });

    response.headers.set("Cache-Control", "private, no-store");
    response.cookies.set("google_auth_nonce", nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 10,
        path: "/api/auth/google",
    });

    return response;
}

export async function googleLoginController(req: NextRequest) {
    try {
        if (req.headers.get("origin") !== req.nextUrl.origin) {
            return errorResponse("Invalid sign-in request", 403);
        }

        const nonce = req.cookies.get("google_auth_nonce")?.value;
        if (!nonce) {
            return errorResponse("Your Google sign-in session expired. Please refresh the page and try again.", 401);
        }

        const body = await req.json().catch(() => null);
        const validation = googleLoginSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse("A valid Google credential is required", 400);
        }

        const user = await loginGoogleUser(validation.data.credential, nonce);
        const token = await createToken(user.id, user.role, user.sessionVersion);
        const response = successResponse({
            user,
            redirectTo: user.role === "admin" ? "/admin" : "/",
        }, "Google sign-in successful");

        response.headers.set("Cache-Control", "private, no-store");
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        response.cookies.set("google_auth_nonce", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 0,
            path: "/api/auth/google",
        });

        return response;
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Google login error:", error);
        return errorResponse("Unable to sign in with Google", 500);
    }
}
