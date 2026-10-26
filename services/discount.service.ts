import mongoose from "mongoose";
import Product from "@/models/Product";
import ActivityLog from "@/models/ActivityLog";
import AppError from "@/lib/AppError";
import { getProductPricing, getProductDiscounts, type ProductDiscount } from "@/lib/product-pricing";
import type { ProductInput } from "@/lib/validations";
import { recordSubscriptionEvents } from "@/services/subscription-event.service";

async function logDiscount(product: { _id: mongoose.Types.ObjectId; name: string; price: number; discountPercent: number; discountAudience?: "all" | "members"; discountEndsAt: Date | null }, action: "discount_started" | "discount_ended", session: mongoose.ClientSession, user?: string, expired = false) {
    const pricing = getProductPricing({ price: product.price, discountPercent: product.discountPercent });
    const discountAmount = Math.round((product.price - pricing.price) * 100) / 100;
    await ActivityLog.create([{
        user,
        action,
        entityType: "product",
        entityId: product._id,
        description: `${product.discountPercent}% discount ${action === "discount_started" ? "started" : "ended"} for product "${product.name}" (Rs. ${discountAmount.toLocaleString("en-PK")} off; ${product.discountAudience === "members" ? "members only" : "everyone"})${expired ? " (offer expired)" : ""}`,
        metadata: {
            discountPercent: product.discountPercent,
            discountAudience: product.discountAudience || "all",
            originalPrice: product.price,
            discountedPrice: pricing.price,
            discountAmount,
            endsAt: product.discountEndsAt,
        },
        ...(expired && product.discountEndsAt ? { createdAt: product.discountEndsAt } : {}),
    }], { session });
}

function discountSnapshots(product: ProductDiscount & { _id: mongoose.Types.ObjectId; name: string; price: number }) {
    return getProductDiscounts(product).map((offer) => ({
        _id: product._id, name: product.name, price: product.price, ...offer,
        discountEndsAt: offer.discountEndsAt ? new Date(offer.discountEndsAt) : null,
    }));
}

export async function expireProductDiscounts() {
    const now = new Date();
    const filter = { $or: [
        { discountPercent: { $gt: 0 }, discountEndsAt: { $ne: null, $lte: now } },
        { memberDiscountPercent: { $gt: 0 }, memberDiscountEndsAt: { $ne: null, $lte: now } },
    ] };
    const expired = await Product.find(filter).select("_id").lean();
    for (const item of expired) {
        await mongoose.connection.transaction(async (session) => {
            const product = await Product.findOne({ _id: item._id, ...filter }).session(session);
            if (!product) return;
            for (const offer of discountSnapshots(product)) {
                if (!offer.discountPercent || !offer.discountEndsAt || offer.discountEndsAt > now) continue;
                await logDiscount(offer, "discount_ended", session, undefined, true);
            }
            if (product.discountEndsAt && product.discountEndsAt <= now) {
                product.discountPercent = 0;
                product.discountEndsAt = null;
            }
            if (product.memberDiscountEndsAt && product.memberDiscountEndsAt <= now) {
                product.memberDiscountPercent = 0;
                product.memberDiscountEndsAt = null;
            }
            await product.save({ session });
        });
    }
}

type DiscountInput = Omit<ProductInput, "discountAudience" | "memberDiscountPercent" | "memberDiscountEndsAt"> & Partial<Pick<ProductInput, "discountAudience" | "memberDiscountPercent" | "memberDiscountEndsAt">>;

export async function saveProductWithDiscount(data: DiscountInput, id?: string, user?: string) {
    const product = await mongoose.connection.transaction(async (session) => {
        const product = id ? await Product.findById(id).session(session) : new Product();
        if (!product) throw new AppError("Product not found", 404);
        const previous = discountSnapshots(product);
        const previousStock = id ? product.stock : undefined;
        const [publicOffer, memberOffer] = getProductDiscounts(data);
        product.name = data.name;
        product.description = data.description;
        product.price = data.price;
        product.image = data.image;
        product.category = new mongoose.Types.ObjectId(data.category);
        product.stock = data.stock;
        product.discountPercent = publicOffer.discountPercent;
        product.discountEndsAt = publicOffer.discountPercent && publicOffer.discountEndsAt ? new Date(publicOffer.discountEndsAt) : null;
        product.discountAudience = "all";
        product.memberDiscountPercent = memberOffer.discountPercent;
        product.memberDiscountEndsAt = memberOffer.discountPercent && memberOffer.discountEndsAt ? new Date(memberOffer.discountEndsAt) : null;
        const next = discountSnapshots(product);
        const changed = next.map((offer, index) => previous[index].discountPercent !== offer.discountPercent
            || previous[index].discountEndsAt?.getTime() !== offer.discountEndsAt?.getTime()
            || Boolean(previous[index].discountEndsAt && previous[index].discountEndsAt!.getTime() <= Date.now()));
        for (let index = 0; index < previous.length; index++) {
            const offer = previous[index];
            if (offer.discountPercent > 0 && changed[index]) {
                const expired = Boolean(offer.discountEndsAt && offer.discountEndsAt.getTime() <= Date.now());
                await logDiscount(offer, "discount_ended", session, expired ? undefined : user, expired);
            }
        }
        await product.save({ session });
        for (let index = 0; index < next.length; index++) {
            if (next[index].discountPercent > 0 && changed[index]) await logDiscount(next[index], "discount_started", session, user);
        }
        await recordSubscriptionEvents(product, previousStock, product.discountPercent > 0 && changed[0], session);
        if (product.memberDiscountPercent > 0 && changed[1]) {
            await recordSubscriptionEvents({ _id: product._id, stock: product.stock, discountPercent: product.memberDiscountPercent, discountAudience: "members" }, undefined, true, session);
        }
        return product;
    });
    return await product.populate("category");
}
