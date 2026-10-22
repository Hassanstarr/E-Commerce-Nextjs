import mongoose, { Document, Model, Types } from "mongoose";

interface ISubscriptionDelivery extends Document {
    user: Types.ObjectId;
    version: number;
    day: string;
    status: "sending" | "sent";
    leaseUntil: Date;
    attempts: number;
    createdAt: Date;
}

const subscriptionDeliverySchema = new mongoose.Schema<ISubscriptionDelivery>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    version: { type: Number, required: true },
    day: { type: String, required: true },
    status: { type: String, enum: ["sending", "sent"], default: "sending" },
    leaseUntil: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

subscriptionDeliverySchema.index({ user: 1, version: 1, day: 1 }, { unique: true });
subscriptionDeliverySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SubscriptionDelivery: Model<ISubscriptionDelivery> = mongoose.models.SubscriptionDelivery || mongoose.model<ISubscriptionDelivery>("SubscriptionDelivery", subscriptionDeliverySchema);

export default SubscriptionDelivery;
