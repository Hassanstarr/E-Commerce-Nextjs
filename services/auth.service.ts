import bcrypt from "bcryptjs";
import User from "@/models/User";
import AppError from "@/lib/AppError";
import type { LoginInput } from "@/lib/validations";

export async function signupUser(token: string, otp: string) {
    const { completeSignup } = await import("@/services/signup-verification.service");
    return await completeSignup(token, otp);
}

export async function loginUser(data: LoginInput) {
    const user = await User.findOne({
        email: data.email.toLowerCase(),
    });

    if (!user || !user.password) {
        throw new AppError("Invalid email or password", 401);
    }

    const passwordMatch = await bcrypt.compare(
        data.password,
        user.password
    );

    if (!passwordMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        sessionVersion: user.sessionVersion || 0,
    };
}

export async function getCurrentUser(userId: string) {
    const user = await User.findById(userId).select("name email role password createdAt updatedAt");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        hasPassword: Boolean(user.password),
    };
}
