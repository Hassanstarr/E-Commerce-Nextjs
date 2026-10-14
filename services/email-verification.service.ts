import { createHash, randomInt } from "crypto";
import nodemailer from "nodemailer";
import User from "@/models/User";
import AppError from "@/lib/AppError";

export async function isCheckoutEmailVerified(userId: string, email: string) {
    return Boolean(await User.exists({
        _id: userId,
        verifiedCheckoutEmails: email.trim().toLowerCase(),
    }));
}

export async function verifyCheckoutEmail(
    userId: string,
    email: string,
    otp?: string
) {
    email = email.trim().toLowerCase();

    if (await isCheckoutEmailVerified(userId, email)) {
        return { verified: true };
    }

    if (otp) {
        const challenge = await User.findOneAndUpdate(
            {
                _id: userId,
                "checkoutEmailVerification.email": email,
                "checkoutEmailVerification.expiresAt": { $gt: new Date() },
                "checkoutEmailVerification.attempts": { $lt: 5 },
            },
            { $inc: { "checkoutEmailVerification.attempts": 1 } },
            { new: true }
        );

        if (!challenge) {
            throw new AppError("OTP expired or too many attempts. Request a new OTP.", 400);
        }

        const otpHash = createHash("sha256").update(otp).digest("hex");

        if (challenge.checkoutEmailVerification?.otpHash !== otpHash) {
            throw new AppError("Invalid OTP. Please try again.", 400);
        }

        const verified = await User.findOneAndUpdate(
            {
                _id: userId,
                "checkoutEmailVerification.email": email,
                "checkoutEmailVerification.otpHash": otpHash,
                "checkoutEmailVerification.expiresAt": { $gt: new Date() },
            },
            {
                $addToSet: { verifiedCheckoutEmails: email },
                $unset: { checkoutEmailVerification: "" },
            }
        );

        if (!verified && !await isCheckoutEmailVerified(userId, email)) {
            throw new AppError("OTP expired. Request a new OTP.", 400);
        }

        return { verified: true };
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new AppError("Email verification is unavailable. Please try again later.", 503);
    }

    const code = randomInt(100000, 1000000).toString();
    const otpHash = createHash("sha256").update(code).digest("hex");
    const now = new Date();

    const user = await User.findOneAndUpdate(
        {
            _id: userId,
            $or: [
                { "checkoutEmailVerification.sentAt": { $exists: false } },
                { "checkoutEmailVerification.sentAt": { $lte: new Date(now.getTime() - 60000) } },
            ],
        },
        {
            $set: {
                checkoutEmailVerification: {
                    email,
                    otpHash,
                    expiresAt: new Date(now.getTime() + 10 * 60000),
                    sentAt: now,
                    attempts: 0,
                },
            },
        }
    );

    if (!user) {
        throw new AppError("Please wait one minute before requesting another OTP.", 429);
    }

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
            subject: "ShopEase Email Verification",
            text: `Your ShopEase verification OTP is ${code}. It expires in 10 minutes.`,
        });
    } catch (error) {
        await User.updateOne(
            { _id: userId, "checkoutEmailVerification.otpHash": otpHash },
            { $unset: { checkoutEmailVerification: "" } }
        );
        console.error("Verification email failed:", error);
        throw new AppError("Unable to send OTP. Please try again.", 502);
    }

    return { verified: false };
}
