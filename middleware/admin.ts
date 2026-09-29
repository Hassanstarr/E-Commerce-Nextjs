import { requireAuth } from "@/middleware/auth";
import { AuthPayload } from "@/lib/auth";
import AppError from "@/lib/AppError";
import User from "@/models/User";

export async function requireAdmin(): Promise<AuthPayload> {
    const user = await requireAuth();

    const dbUser = await User.findById(user.userId).select("role");

    if (!dbUser) {
        throw new AppError("User not found", 404);
    }

    if (dbUser.role !== "admin") {
        throw new AppError("Admin access required", 403);
    }

    return {
        ...user,
        role: dbUser.role,
    };
}