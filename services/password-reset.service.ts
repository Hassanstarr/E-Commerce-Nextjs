import { createHmac, randomBytes, randomInt } from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "@/models/User";
import AppError from "@/lib/AppError";

function hashResetValue(email: string, value: string) {
    if (!process.env.JWT_SECRET) {
        throw new AppError("Password reset is unavailable. Please try again later.", 503);
    }

    return createHmac("sha256", process.env.JWT_SECRET)
        .update(`password-reset:${email}:${value}`)
        .digest("hex");
}

export async function requestPasswordReset(email: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new AppError("Password reset email is unavailable. Please try again later.", 503);
    }

    const code = randomInt(100000, 1000000).toString();
    const otpHash = hashResetValue(email, code);
    const now = new Date();
    const user = await User.findOneAndUpdate(
        {
            email,
            $or: [
                { "passwordReset.sentAt": { $exists: false } },
                { "passwordReset.sentAt": { $lte: new Date(now.getTime() - 60000) } },
            ],
        },
        {
            $set: {
                passwordReset: {
                    otpHash,
                    expiresAt: new Date(now.getTime() + 10 * 60000),
                    sentAt: now,
                    attempts: 0,
                },
            },
        }
    );

    // Use the same response for unknown emails and requests during the cooldown.
    if (!user) return;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset your ShopEase password",
            text: `Your ShopEase password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email. Do not share this code.`,
        });
    } catch (error) {
        await User.updateOne(
            { _id: user._id, "passwordReset.otpHash": otpHash },
            { $unset: { passwordReset: "" } }
        );
        console.error("Password reset email failed:", error);
        throw new AppError("Unable to send reset code. Please try again later.", 502);
    }
}

export async function verifyPasswordReset(email: string, otp: string) {
    const invalidCode = "Invalid or expired code. Request a new code if needed.";
    const user = await User.findOneAndUpdate(
        {
            email,
            "passwordReset.otpHash": { $exists: true },
            "passwordReset.expiresAt": { $gt: new Date() },
            "passwordReset.attempts": { $lt: 5 },
        },
        { $inc: { "passwordReset.attempts": 1 } },
        { new: true }
    ).select("+passwordReset");

    const otpHash = hashResetValue(email, otp);
    if (!user || user.passwordReset?.otpHash !== otpHash) {
        throw new AppError(invalidCode, 400);
    }

    const token = randomBytes(32).toString("hex");
    const verified = await User.updateOne(
        {
            _id: user._id,
            "passwordReset.otpHash": otpHash,
            "passwordReset.expiresAt": { $gt: new Date() },
            "passwordReset.attempts": { $lte: 5 },
        },
        {
            $set: { "passwordReset.tokenHash": hashResetValue(email, token) },
            $unset: { "passwordReset.otpHash": "" },
        }
    );

    if (!verified.modifiedCount) {
        throw new AppError(invalidCode, 400);
    }

    return { token };
}

export async function resetPassword(email: string, token: string, password: string) {
    const tokenHash = hashResetValue(email, token);
    const filter = {
        email,
        "passwordReset.tokenHash": tokenHash,
        "passwordReset.expiresAt": { $gt: new Date() },
    };

    if (!await User.exists(filter)) {
        throw new AppError("Your reset session expired. Request a new code.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await User.updateOne(
        { ...filter, "passwordReset.expiresAt": { $gt: new Date() } },
        {
            $set: { password: hashedPassword },
            $inc: { sessionVersion: 1 },
            $unset: { passwordReset: "" },
        }
    );

    if (!result.modifiedCount) {
        throw new AppError("Your reset session expired. Request a new code.", 400);
    }
}
