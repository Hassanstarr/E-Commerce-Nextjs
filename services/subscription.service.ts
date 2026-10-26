import mongoose from "mongoose";
import nodemailer from "nodemailer";
import User from "@/models/User";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Wishlist from "@/models/Wishlist";
import Cart from "@/models/Cart";
import Subscription, { ISubscription } from "@/models/Subscription";
import SubscriptionEvent from "@/models/SubscriptionEvent";
import SubscriptionDelivery from "@/models/SubscriptionDelivery";
import AppError from "@/lib/AppError";
import { defaultSubscription, subscriptionDeliveryDay, SubscriptionPreferences } from "@/lib/subscription";
import { getProductPricing } from "@/lib/product-pricing";
import { getUserRole } from "@/lib/membership";

function preferences(subscription: ISubscription | null): SubscriptionPreferences {
    if (!subscription) return { ...defaultSubscription, categories: [] };
    return {
        wishlistRestock: subscription.wishlistRestock,
        discounts: subscription.discounts,
        discountScope: subscription.discountScope,
        categories: subscription.categories.map((id) => id.toString()),
        cartReminder: subscription.cartReminder,
    };
}

export async function getSubscription(userId: string) {
    const [user, subscription, categories] = await Promise.all([
        User.findById(userId).select("email").lean(),
        Subscription.findOne({ user: userId }),
        Category.find().select("name").sort({ name: 1 }).lean(),
    ]);
    if (!user) throw new AppError("User not found", 404);
    return { email: user.email, preferences: preferences(subscription), categories };
}

export async function saveSubscription(userId: string, data: SubscriptionPreferences) {
    const categories = data.discounts && data.discountScope === "categories" ? [...new Set(data.categories)] : [];
    if (categories.length && await Category.countDocuments({ _id: { $in: categories } }) !== categories.length) {
        throw new AppError("A selected category is no longer available. Refresh and try again.", 400);
    }
    const existing = await Subscription.findOne({ user: userId });
    const next = { ...data, categories };
    if (existing && JSON.stringify(preferences(existing)) === JSON.stringify(next)) return preferences(existing);

    await Subscription.init();
    const subscription = await Subscription.findOneAndUpdate({ user: userId }, {
        $set: { ...next, eventsAfter: new Date(), lastCheckedAt: new Date(0) },
        $inc: { version: 1 },
    }, { upsert: true, returnDocument: "after", runValidators: true });
    return preferences(subscription);
}

export function subscriptionAppUrl() {
    const value = process.env.NEXT_PUBLIC_APP_URL;
    if (!value) throw new AppError("Set NEXT_PUBLIC_APP_URL before sending subscription emails.", 503);
    let url;
    try { url = new URL(value); } catch { throw new AppError("NEXT_PUBLIC_APP_URL must be a valid website URL.", 503); }
    if (!["http:", "https:"].includes(url.protocol) || (process.env.NODE_ENV === "production" && url.protocol !== "https:")) {
        throw new AppError("NEXT_PUBLIC_APP_URL must use HTTPS in production.", 503);
    }
    return url.origin;
}

export async function buildSubscriptionEmail(subscription: ISubscription, now: Date, appUrl: string) {
    const user = await User.findById(subscription.user).select("role memberUntil").lean();
    const role = user ? getUserRole(user) : "user";
    const wishlist = subscription.wishlistRestock
        ? await Wishlist.findOne({ user: subscription.user }).select("products").lean()
        : null;
    const types = [];
    if (subscription.wishlistRestock && wishlist?.products.length) {
        types.push({ type: "restock", product: { $in: wishlist.products } });
    }
    if (subscription.discounts) types.push({ type: "discount", ...(role !== "member" ? { discountAudience: { $ne: "members" } } : {}) });
    const events = types.length ? await SubscriptionEvent.aggregate([
        { $match: { createdAt: { $gt: subscription.eventsAfter, $lte: now }, $or: types } },
        { $sort: { createdAt: -1, _id: -1 } },
        { $group: { _id: { product: "$product", type: "$type", audience: { $ifNull: ["$discountAudience", "all"] } }, event: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$event" } },
        { $lookup: { from: Product.collection.name, localField: "product", foreignField: "_id", as: "item" } },
        { $unwind: "$item" },
        { $match: { "item.stock": { $gt: 0 }, $or: [
            { type: "restock" },
            { type: "discount", ...(subscription.discountScope === "categories" ? { "item.category": { $in: subscription.categories } } : {}) },
        ] } },
        { $sort: { createdAt: -1, _id: -1 } },
        { $limit: 20 },
        { $project: { type: 1, discountPercent: 1, discountAudience: 1, item: { _id: 1, name: 1, price: 1, discountPercent: 1, discountEndsAt: 1, discountAudience: 1, memberDiscountPercent: 1, memberDiscountEndsAt: 1 } } },
    ]) : [];

    const lines: string[] = [];
    for (const event of events) {
        const item = event.item;
        const offer = getProductPricing(item, now.getTime(), role).offers.find((offer) => offer.discountAudience === (event.discountAudience || "all") && offer.discountPercent === event.discountPercent);
        if (event.type === "discount" && !offer) continue;
        const label = event.type === "restock" ? "Back in stock on your wishlist" : `${offer!.discountPercent}% off${offer!.discountAudience === "members" ? " (members only)" : ""}`;
        lines.push(`${label}: ${item.name}\n${appUrl}/products/${item._id}`);
    }

    let cartUpdatedAt: Date | undefined;
    if (subscription.cartReminder) {
        const cart = await Cart.findOne({ user: subscription.user, "items.0": { $exists: true } }).lean();
        if (cart && cart.updatedAt.getTime() <= now.getTime() - 2 * 24 * 60 * 60 * 1000
            && (!subscription.lastCartRemindedAt || cart.updatedAt > subscription.lastCartRemindedAt)) {
            const available = await Product.exists({ _id: { $in: cart.items.map((item) => item.product) }, stock: { $gt: 0 } });
            if (available) {
                lines.push(`Still interested? You have items waiting in your cart. Prices and availability may change.\n${appUrl}/cart`);
                cartUpdatedAt = cart.updatedAt;
            }
        }
    }

    return {
        hasUpdates: lines.length > 0,
        cartUpdatedAt,
        text: `Your ShopEase updates\n\n${lines.join("\n\n")}\n\nManage subscriptions or unsubscribe:\n${appUrl}/subscription\nSign in with your registered account, uncheck the emails you no longer want, and save.\n\nThese preferences do not affect order or security emails.`,
    };
}

export async function sendSubscriptionEmails({ allowRepeat = false }: { allowRepeat?: boolean } = {}) {
    if (allowRepeat && process.env.NODE_ENV === "production") {
        throw new AppError("Repeated subscription delivery is only available for local testing.", 400);
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) throw new AppError("Email delivery is not configured.", 503);
    const appUrl = subscriptionAppUrl();
    await SubscriptionDelivery.init();
    const started = new Date();
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000,
    });
    const result = { checked: 0, sent: 0, failed: 0 };

    while (Date.now() - started.getTime() < 240000) {
        const subscription = await Subscription.findOne({
            lastCheckedAt: { $lt: started },
            $or: [{ wishlistRestock: true }, { discounts: true }, { cartReminder: true }],
        }).sort({ lastCheckedAt: 1, _id: 1 });
        if (!subscription) break;
        const now = new Date();
        await Subscription.updateOne({ _id: subscription._id, version: subscription.version }, { $set: { lastCheckedAt: now } });
        result.checked++;
        const message = await buildSubscriptionEmail(subscription, now, appUrl);
        if (!message.hasUpdates) {
            await Subscription.updateOne({ _id: subscription._id, version: subscription.version }, { $set: { eventsAfter: now } });
            continue;
        }

        // Local repeats share a claim until pending updates have been processed.
        let delivery;
        try {
            delivery = await SubscriptionDelivery.findOneAndUpdate({
                user: subscription.user, version: subscription.version,
                day: subscriptionDeliveryDay(started, subscription.eventsAfter, allowRepeat),
                status: "sending", leaseUntil: { $lte: now }, attempts: { $lt: 5 },
            }, {
                $set: { leaseUntil: new Date(now.getTime() + 10 * 60000) },
                $inc: { attempts: 1 },
            }, { upsert: true, returnDocument: "after" });
        } catch (error) {
            if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) continue;
            throw error;
        }

        try {
            const [user, current] = await Promise.all([
                User.findById(subscription.user).select("email").lean(),
                Subscription.exists({ _id: subscription._id, version: subscription.version }),
            ]);
            if (!user || !current) continue;
            await transporter.sendMail({
                from: process.env.EMAIL_USER, to: user.email,
                subject: "Your ShopEase subscription updates", text: message.text,
            });
            await mongoose.connection.transaction(async (session) => {
                await SubscriptionDelivery.updateOne({ _id: delivery._id }, { $set: { status: "sent" } }, { session });
                await Subscription.updateOne({ _id: subscription._id, version: subscription.version }, { $set: {
                    eventsAfter: now,
                    ...(message.cartUpdatedAt ? { lastCartRemindedAt: message.cartUpdatedAt } : {}),
                } }, { session });
            });
            result.sent++;
        } catch (error) {
            result.failed++;
            await SubscriptionDelivery.updateOne({ _id: delivery._id }, { $set: { leaseUntil: new Date(Date.now() + 60 * 60000) } });
            console.error("Subscription email delivery failed:", error instanceof Error ? error.message : "Unknown error");
        }
    }
    return result;
}
