import mongoose, { Document, Model, Types } from "mongoose";
import type { CreateOrderInput, OrderItem } from "@/types/order";

export interface IStripeCheckout extends Document {
    user: Types.ObjectId;
    requestKey: string;
    orderData: CreateOrderInput & {
        items: OrderItem[];
        subtotal: number;
        deliveryFee: number;
        total: number;
    };
    stripeSessionId?: string;
    paymentIntentId?: string;
    stripeRefundId?: string;
    refundStatus?: "pending" | "requires_action" | "succeeded" | "failed" | "canceled";
    updatedAt: Date;
    status: "pending" | "failed" | "canceled" | "paid" | "refund_pending" | "refunded";
    order?: Types.ObjectId;
}

const stripeCheckoutSchema = new mongoose.Schema<IStripeCheckout>(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true 
        },
        requestKey: { 
            type: String,
            required: true,
            unique: true 
        },
        orderData: { 
            type: mongoose.Schema.Types.Mixed,
            required: true 
        },
        stripeSessionId: { 
            type: String,
            unique: true,
            sparse: true 
        },
        paymentIntentId: String,
        stripeRefundId: String,
        refundStatus: { type: String, enum: ["pending", "requires_action", "succeeded", "failed", "canceled"] },
        status: {
            type: String,
            enum: ["pending", "failed", "canceled", "paid", "refund_pending", "refunded"],
            default: "pending",
        },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    },
    { timestamps: true }
);

const StripeCheckout: Model<IStripeCheckout> = mongoose.models.StripeCheckout || mongoose.model<IStripeCheckout>("StripeCheckout", stripeCheckoutSchema);

export default StripeCheckout;
