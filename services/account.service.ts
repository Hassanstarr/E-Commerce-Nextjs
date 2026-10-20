import bcrypt from "bcryptjs";
import User from "@/models/User";
import AppError from "@/lib/AppError";

export async function updateAccountProfile(userId: string, name: string) {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { name } },
        { new: true, runValidators: true }
    ).select("name");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return { name: user.name };
}

export async function changeAccountPassword(
    userId: string,
    sessionVersion: number,
    currentPassword: string,
    newPassword: string
) {
    const user = await User.findById(userId).select("password sessionVersion");

    if (!user || (user.sessionVersion || 0) !== sessionVersion) {
        throw new AppError("Your session has expired. Please log in again.", 401);
    }

    if (!user.password) {
        throw new AppError("Your account uses Google sign-in and does not have a password to change.", 400);
    }

    if (!await bcrypt.compare(currentPassword, user.password)) {
        throw new AppError("Current password is incorrect", 400);
    }

    if (currentPassword === newPassword) {
        throw new AppError("Choose a different password from your current password", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, password: user.password },
        {
            $set: { password: hashedPassword },
            $inc: { sessionVersion: 1 },
            $unset: { passwordReset: "" },
        },
        { new: true }
    ).select("role sessionVersion");

    if (!updatedUser) {
        throw new AppError("Your password changed during this request. Please log in again.", 409);
    }

    return {
        id: userId,
        role: updatedUser.role,
        sessionVersion: updatedUser.sessionVersion,
    };
}
