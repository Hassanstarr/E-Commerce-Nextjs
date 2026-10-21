import mongoose from "mongoose";
import Product from "@/models/Product";
import ActivityLog from "@/models/ActivityLog";
import AppError from "@/lib/AppError";
import { getProductPricing } from "@/lib/product-pricing";
import type { ProductInput } from "@/lib/validations";

async function logDiscount(product: { _id: mongoose.Types.ObjectId; name: string; price: number; discountPercent: number; discountEndsAt: Date | null }, action: "discount_started" | "discount_ended", session: mongoose.ClientSession, user?: string, expired = false) {
    const pricing = getProductPricing({ price: product.price, discountPercent: product.discountPercent });
    const discountAmount = Math.round((product.price - pricing.price) * 100) / 100;
    await ActivityLog.create([{
        user,
        action,
        entityType: "product",
        entityId: product._id,
        description: `${product.discountPercent}% discount ${action === "discount_started" ? "started" : "ended"} for product "${product.name}" (Rs. ${discountAmount.toLocaleString("en-PK")} off)${expired ? " (offer expired)" : ""}`,
        metadata: {
            discountPercent: product.discountPercent,
            originalPrice: product.price,
            discountedPrice: pricing.price,
            discountAmount,
            endsAt: product.discountEndsAt,
        },
        ...(expired && product.discountEndsAt ? { createdAt: product.discountEndsAt } : {}),
    }], { session });
}

export async function expireProductDiscounts() {
    const now = new Date();
    const expired = await Product.find({ discountPercent: { $gt: 0 }, discountEndsAt: { $ne: null, $lte: now } }).select("_id").lean();

    for (const item of expired) {
        await mongoose.connection.transaction(async (session) => {
            const product = await Product.findOne({ _id: item._id, discountPercent: { $gt: 0 }, discountEndsAt: { $ne: null, $lte: now } }).session(session);
            if (!product) return;
            await logDiscount(product, "discount_ended", session, undefined, true);
            product.discountPercent = 0;
            product.discountEndsAt = null;
            await product.save({ session });
        });
    }
}

export async function saveProductWithDiscount(data: ProductInput, id?: string, user?: string) {
    const product = await mongoose.connection.transaction(async (session) => {
        const product = id ? await Product.findById(id).session(session) : new Product();
        if (!product) throw new AppError("Product not found", 404);
        const previous = {
            _id: product._id, name: product.name, price: product.price,
            discountPercent: product.discountPercent || 0, discountEndsAt: product.discountEndsAt,
        };
        const expired = Boolean(previous.discountEndsAt && previous.discountEndsAt.getTime() <= Date.now());
        const changed = previous.discountPercent !== data.discountPercent || expired;

        if (previous.discountPercent > 0 && changed) {
            await logDiscount(previous, "discount_ended", session, expired ? undefined : user, expired);
        }

        product.name = data.name;
        product.description = data.description;
        product.price = data.price;
        product.image = data.image;
        product.category = new mongoose.Types.ObjectId(data.category);
        product.stock = data.stock;
        product.discountPercent = data.discountPercent;
        product.discountEndsAt = data.discountPercent && data.discountEndsAt ? new Date(data.discountEndsAt) : null;
        await product.save({ session });

        if (product.discountPercent > 0 && changed) {
            await logDiscount(product, "discount_started", session, user);
        }
        return product;
    });

    return await product.populate("category");
}
