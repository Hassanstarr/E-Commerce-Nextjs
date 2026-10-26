import mongoose, { Document, Model, Types } from "mongoose";

export interface ISubscriptionEvent extends Document {
    product: Types.ObjectId;
    type: "restock" | "discount";
    discountPercent: number;
    discountAudience: "all" | "members";
    createdAt: Date;
}

const subscriptionEventSchema = new mongoose.Schema<ISubscriptionEvent>({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["restock", "discount"], required: true },
    discountPercent: { type: Number, default: 0 },
    discountAudience: { type: String, enum: ["all", "members"], default: "all" },
    createdAt: { type: Date, default: Date.now },
});

subscriptionEventSchema.index({ createdAt: 1, type: 1 });
subscriptionEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SubscriptionEvent: Model<ISubscriptionEvent> = mongoose.models.SubscriptionEvent || mongoose.model<ISubscriptionEvent>("SubscriptionEvent", subscriptionEventSchema);

export default SubscriptionEvent;
