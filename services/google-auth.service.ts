import User from "@/models/User";
import AppError from "@/lib/AppError";
import { verifyGoogleCredential } from "@/lib/google-auth";
import { createActivityLog } from "./activity.service";

export async function loginGoogleUser(credential: string, nonce: string) {
    const profile = await verifyGoogleCredential(credential, nonce);
    let user = await User.findOne({ googleId: profile.googleId });

    if (!user) {
        const existingUser = await User.findOne({ email: profile.email });

        if (existingUser) {
            if (existingUser.googleId || !profile.authoritativeEmail) {
                throw new AppError("An account with this email already exists. Please sign in with your original login method.", 409);
            }

            user = await User.findOneAndUpdate(
                { _id: existingUser._id, googleId: { $exists: false } },
                { $set: { googleId: profile.googleId } },
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new AppError("Your account changed while signing in. Please try again.", 409);
            }
        } else {
            const name = profile.name.slice(0, 50);

            try {
                user = await User.create({
                    name: name.length >= 2 ? name : "Google User",
                    email: profile.email,
                    googleId: profile.googleId,
                    role: "user",
                });
            } catch (error) {
                if (error && typeof error === "object" && "code" in error && error.code === 11000) {
                    throw new AppError("An account was created while signing in. Please try again.", 409);
                }
                throw error;
            }

            await createActivityLog({
                action: "register",
                entityType: "customer",
                entityId: user._id.toString(),
                description: `New customer "${user.name}" registered with Google`,
            });
        }
    }

    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
    };
}
