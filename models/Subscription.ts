import mongoose, { Document, Model, Types } from "mongoose";

export interface ISubscription extends Document {
    user: Types.ObjectId;
    wishlistRestock: boolean;
    discounts: boolean;
    discountScope: "all" | "categories";
    categories: Types.ObjectId[];
    cartReminder: boolean;
    version: number;
    eventsAfter: Date;
    lastCheckedAt: Date;
    lastCartRemindedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new mongoose.Schema<ISubscription>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    wishlistRestock: { type: Boolean, default: false },
    discounts: { type: Boolean, default: false },
    discountScope: { type: String, enum: ["all", "categories"], default: "all" },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    cartReminder: { type: Boolean, default: false },
    version: { type: Number, default: 0 },
    eventsAfter: { type: Date, default: Date.now },
    lastCheckedAt: { type: Date, default: () => new Date(0), index: true },
    lastCartRemindedAt: Date,
}, { timestamps: true });

const Subscription: Model<ISubscription> = mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
