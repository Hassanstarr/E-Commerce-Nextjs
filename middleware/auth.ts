import { cookies } from "next/headers";
import { verifyToken, AuthPayload } from "@/lib/auth";
import AppError from "@/lib/AppError";
import User from "@/models/User";

export async function requireAuth(): Promise<AuthPayload> {
    const cookieStore = await cookies();

    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        throw new AppError("Authentication required", 401);
    }

    const payload = await verifyToken(token);

    if (!payload) {
        throw new AppError("Invalid or expired token", 401);
    }

    return payload;
}