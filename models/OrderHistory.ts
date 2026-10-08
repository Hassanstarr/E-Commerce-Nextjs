import mongoose, { Schema } from "mongoose";

const orderHistorySchema = new Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "shipped",
                "delivered",
                "cancelled",
            ],
            required: true,
        },

        changedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        note: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const OrderHistory = mongoose.models.OrderHistory || mongoose.model("OrderHistory", orderHistorySchema);

export default OrderHistory;