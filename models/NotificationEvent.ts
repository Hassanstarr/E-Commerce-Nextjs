import mongoose, { Schema, type Model, type Document } from "mongoose";
import type { NotificationType } from "@/types/notification";

export type NotificationAudience = "customers" | "members" | "admins" | "user" | "wishlist";
export type NotificationEventInput = {
    key: string;
    type: NotificationType;
    audience: NotificationAudience;
    title: string;
    message: string;
    href: string;
    userId?: string;
    productId?: string;
    excludeUserId?: string;
    offerEndsAt?: Date | null;
    discountAudience?: "all" | "members";
    discountPercent?: number;
    checkoutId?: string;
    invoiceId?: string;
    reminder?: { subscriptionId: string; periodEnd: string; canceled: boolean };
};

export interface INotificationEvent extends Document, NotificationEventInput {
    createdAt: Date;
    expiresAt: Date;
    status: "pending" | "delivered";
    cursor: string;
    lockToken?: string;
    lockUntil?: Date;
    nextAttempt: Date;
    attempts: number;
}

const schema = new Schema<INotificationEvent>({
    key: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    audience: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    href: { type: String, required: true },
    userId: String, productId: String, excludeUserId: String,
    offerEndsAt: Date, discountAudience: String, discountPercent: Number,
    checkoutId: String,
    invoiceId: String,
    reminder: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, required: true },
    status: { type: String, default: "pending" },
    cursor: { type: String, default: "" },
    lockToken: String, lockUntil: Date,
    nextAttempt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
}, { timestamps: true });

schema.index({ status: 1, nextAttempt: 1, createdAt: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const NotificationEvent: Model<INotificationEvent> = mongoose.models.NotificationEvent || mongoose.model<INotificationEvent>("NotificationEvent", schema);
export default NotificationEvent;
