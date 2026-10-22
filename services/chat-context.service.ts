import mongoose from "mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";
import { getProductPricing } from "@/lib/product-pricing";

export const chatDataTool = {
    name: "get_store_data",
    description: "Read current data for the signed-in customer or search the public product catalog. Orders are newest first. Use this before answering questions about actual orders, account, cart, wishlist, prices or stock. Cannot change anything.",
    parameters: {
        type: "object",
        properties: {
            section: { type: "string", enum: ["profile", "orders", "cart", "wishlist", "products"] },
            query: { type: "string", description: "Optional product name, or full/short order ID. Empty means recent orders or products." },
        },
        required: ["section"],
    },
};

const productFields = "name price discountPercent discountEndsAt stock";

function productData(product: { _id: mongoose.Types.ObjectId; name: string; price: number; stock: number; discountPercent?: number; discountEndsAt?: Date | null }) {
    return { id: product._id.toString(), name: product.name, ...getProductPricing(product), stock: product.stock };
}

// The customer ID comes from the authenticated conversation, never from Gemini arguments.
export async function getChatStoreData(userId: string, args: Record<string, unknown>) {
    if (!mongoose.isObjectIdOrHexString(userId)) return { error: "Customer not found" };
    const query = typeof args.query === "string" ? args.query.trim().slice(0, 100) : "";
    if (args.section === "profile") {
        const user = await User.findById(userId).select("name email -_id").lean();
        return { profile: user };
    }
    if (args.section === "orders") {
        const id = query.replace(/^#/, "");
        if (id && !/^[a-f\d]{6,24}$/i.test(id)) return { error: "Use the order ID shown in My Orders" };
        const filter = id ? { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: `${id}$`, options: "i" } } } : {};
        const orders = await Order.find({ user: userId, ...filter })
            .sort({ createdAt: -1 }).limit(21)
            .select("items.name items.price items.quantity total subtotal deliveryFee paymentMethod paymentStatus orderStatus createdAt").lean();
        return { orders: orders.slice(0, 20), hasMore: orders.length > 20, currency: "PKR", note: "Short IDs can match multiple orders; ask which one if ambiguous. No results means no matching orders for this customer." };
    }
    if (args.section === "cart") {
        const cart = await Cart.findOne({ user: userId }).select("items").lean();
        const items = cart?.items || [];
        const products = await Product.find({ _id: { $in: items.slice(0, 30).map((item) => item.product) } }).select(productFields).lean();
        return {
            items: items.slice(0, 30).map((item) => {
                const product = products.find((entry) => entry._id.equals(item.product));
                return { product: product ? productData(product) : { unavailable: true }, quantity: item.quantity };
            }),
            hasMore: items.length > 30, currency: "PKR",
        };
    }
    if (args.section === "wishlist") {
        const wishlist = await Wishlist.findOne({ user: userId }).select("products").lean();
        const ids = wishlist?.products || [];
        const products = await Product.find({ _id: { $in: ids.slice(0, 30) } }).select(productFields).lean();
        return { products: products.map(productData), hasMore: ids.length > 30, currency: "PKR" };
    }
    if (args.section === "products") {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const products = await Product.find(query ? { name: { $regex: escaped, $options: "i" } } : {})
            .sort({ createdAt: -1 }).limit(11).select(productFields).lean();
        return { products: products.slice(0, 10).map(productData), hasMore: products.length > 10, currency: "PKR" };
    }
    return { error: "Unknown section. Available: profile, orders, cart, wishlist, products." };
}
