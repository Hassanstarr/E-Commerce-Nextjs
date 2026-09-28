    import mongoose, { Document, Model, Types } from "mongoose";

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    user: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema<ICartItem>(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
            default: 1,
        },
    },
    {
        _id: false,
    }
);

const cartSchema = new mongoose.Schema<ICart>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        items: {
            type: [cartItemSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);

export default Cart;