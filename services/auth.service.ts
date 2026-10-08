import bcrypt from "bcryptjs";
import User from "@/models/User";
import AppError from "@/lib/AppError";
import type { LoginInput, SignupInput } from "@/lib/validations";
import { createActivityLog } from "./activity.service";

export async function signupUser(data: SignupInput) {
    const existingUser = await User.findOne({
        email: data.email.toLowerCase(),
    });

    if (existingUser) {
        throw new AppError("An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: "user",
    });

    await createActivityLog({
        action: "register",
        entityType: "customer",
        entityId: user._id.toString(),
        description: `New customer "${user.name}" registered`,
    });
    
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

export async function loginUser(data: LoginInput) {
    const user = await User.findOne({
        email: data.email.toLowerCase(),
    });

    if (!user) {
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
    };
}

export async function getCurrentUser(userId: string) {
    const user = await User.findById(userId).select("-password");

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
    };
}