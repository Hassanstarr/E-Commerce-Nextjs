import { cookies } from "next/headers";
import { verifyToken, AuthPayload } from "@/lib/auth";
import AppError from "@/lib/AppError";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { getUserRole } from "@/lib/membership";

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

    await connectDB();
    const user = await User.findById(payload.userId).select("sessionVersion role memberUntil");

    if (!user || (user.sessionVersion || 0) !== payload.sessionVersion) {
        throw new AppError("Your session has expired. Please log in again.", 401);
    }

    return { ...payload, role: getUserRole(user) };
}
