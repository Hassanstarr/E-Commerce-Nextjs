import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import PendingSignup from "@/models/PendingSignup";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import AppError from "@/lib/AppError";
import type { SignupInput } from "@/lib/validations";

const expiredMessage = "Your registration session expired or changed. Go back and sign up again.";

function hashSignupToken(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) throw new AppError(expiredMessage, 400);
    return createHash("sha256").update(token).digest("hex");
}

function hashSignupCode(tokenHash: string, code: string) {
    if (!process.env.JWT_SECRET) throw new AppError("Email verification is unavailable. Please try again later.", 503);
    return createHmac("sha256", process.env.JWT_SECRET).update(`signup:${tokenHash}:${code}`).digest("hex");
}

async function sendSignupCode(email: string, code: string) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new AppError("Email verification is unavailable. Please try again later.", 503);
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your ShopEase account",
        text: `Your ShopEase registration code is ${code}. It expires in 10 minutes. Enter it on the signup screen to create your account. If you did not request this, ignore this email. Do not share this code.`,
    });
}

async function deliverSignupCode(tokenHash: string, otpHash: string, email: string, code: string) {
    try {
        await sendSignupCode(email, code);
    } catch (error) {
        await PendingSignup.deleteOne({ tokenHash, otpHash });
        console.error("Signup verification email failed:", error instanceof Error ? error.message : "Unknown error");
        if (error instanceof AppError) throw error;
        throw new AppError("Unable to send verification code. Go back and try signing up again.", 502);
    }
}

export async function requestSignup(data: SignupInput) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new AppError("Email verification is unavailable. Please try again later.", 503);
    }
    const email = data.email.trim().toLowerCase();
    if (await User.exists({ email })) throw new AppError("An account with this email already exists", 409);
    await PendingSignup.init();

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashSignupToken(token);
    const code = randomInt(100000, 1000000).toString();
    const otpHash = hashSignupCode(tokenHash, code);
    const passwordHash = await bcrypt.hash(data.password, 12);
    const now = new Date();

    try {
        await PendingSignup.findOneAndUpdate({
            email,
            $or: [{ sentAt: { $lte: new Date(now.getTime() - 60000) } }, { sentAt: { $exists: false } }],
        }, { $set: {
            email, name: data.name, passwordHash, tokenHash, otpHash, attempts: 0,
            sentAt: now, expiresAt: new Date(now.getTime() + 10 * 60000),
        } }, { upsert: true, runValidators: true });
    } catch (error) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
            throw new AppError("Please wait one minute before requesting another registration code.", 429);
        }
        throw error;
    }

    await deliverSignupCode(tokenHash, otpHash, email, code);
    return { token, email, resendAfter: 60 };
}

export async function resendSignupCode(token: string) {
    const tokenHash = hashSignupToken(token);
    const now = new Date();
    const code = randomInt(100000, 1000000).toString();
    const otpHash = hashSignupCode(tokenHash, code);
    const pending = await PendingSignup.findOneAndUpdate({
        tokenHash, expiresAt: { $gt: now }, sentAt: { $lte: new Date(now.getTime() - 60000) },
    }, { $set: { otpHash, attempts: 0, sentAt: now, expiresAt: new Date(now.getTime() + 10 * 60000) } }, { returnDocument: "after" });

    if (!pending) {
        if (await PendingSignup.exists({ tokenHash, expiresAt: { $gt: now } })) {
            throw new AppError("Please wait one minute before requesting another registration code.", 429);
        }
        throw new AppError(expiredMessage, 400);
    }
    await deliverSignupCode(tokenHash, otpHash, pending.email, code);
    return { token, email: pending.email, resendAfter: 60 };
}

export async function completeSignup(token: string, otp: string) {
    const tokenHash = hashSignupToken(token);
    const pending = await PendingSignup.findOneAndUpdate({
        tokenHash, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 },
    }, { $inc: { attempts: 1 } }, { returnDocument: "after" }).select("+otpHash +passwordHash");

    if (!pending) throw new AppError("Code expired or too many attempts. Resend a code or go back and sign up again.", 400);
    const otpHash = hashSignupCode(tokenHash, otp);
    if (!timingSafeEqual(Buffer.from(pending.otpHash, "hex"), Buffer.from(otpHash, "hex"))) {
        throw new AppError("Incorrect verification code. Please try again.", 400);
    }

    try {
        return await mongoose.connection.transaction(async (session) => {
            const consumed = await PendingSignup.findOneAndDelete({
                _id: pending._id, tokenHash, otpHash, expiresAt: { $gt: new Date() }, attempts: { $lte: 5 },
            }, { session });
            if (!consumed) throw new AppError("Code expired or already used. Please restart registration.", 400);
            if (await User.exists({ email: pending.email }).session(session)) {
                throw new AppError("An account with this email already exists. Please log in.", 409);
            }
            const [user] = await User.create([{
                name: pending.name, email: pending.email, password: pending.passwordHash,
                role: "user", emailVerifiedAt: new Date(),
            }], { session });
            await ActivityLog.create([{
                action: "register", entityType: "customer", entityId: user._id,
                description: `New customer "${user.name}" registered with verified email`,
            }], { session });

            return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, sessionVersion: user.sessionVersion || 0 };
        });
    } catch (error) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
            throw new AppError("An account with this email already exists. Please log in.", 409);
        }
        throw error;
    }
}
