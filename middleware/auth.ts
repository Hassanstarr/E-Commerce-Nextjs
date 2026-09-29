import { cookies } from "next/headers";
import { verifyToken, AuthPayload } from "@/lib/auth";
import AppError from "@/lib/AppError";

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

export async function requireAdmin(): Promise<AuthPayload> {
    const user = await requireAuth();

    if (user.role !== "admin") {
        throw new AppError("Admin access required", 403);
    }

    return user;
}