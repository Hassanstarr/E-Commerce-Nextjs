import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    sessionVersion: number;
    passwordReset?: {
        otpHash?: string;
        tokenHash?: string;
        expiresAt: Date;
        sentAt: Date;
        attempts: number;
    };
    role: "user" | "admin";
    verifiedCheckoutEmails: string[];
    checkoutEmailVerification?: {
        email: string;
        otpHash: string;
        expiresAt: Date;
        sentAt: Date;
        attempts: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: [function (this: IUser) { return !this.googleId; }, "Password is required"],
            minlength: [6, "Password must contain at least 6 characters"],
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        verifiedCheckoutEmails: {
            type: [String],
            default: [],
        },

        sessionVersion: {
            type: Number,
            default: 0,
        },

        passwordReset: {
            type: new mongoose.Schema({
                otpHash: String,
                tokenHash: String,
                expiresAt: Date,
                sentAt: Date,
                attempts: Number,
            }, { _id: false }),
            select: false,
        },

        checkoutEmailVerification: {
            email: String,
            otpHash: String,
            expiresAt: Date,
            sentAt: Date,
            attempts: Number,
        },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
