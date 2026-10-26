import type mongoose from "mongoose";
import SubscriptionEvent from "@/models/SubscriptionEvent";

// Save events in the same transaction as inventory and discount changes.
export async function recordSubscriptionEvents(
    product: { _id: mongoose.Types.ObjectId; stock: number; discountPercent: number; discountAudience?: "all" | "members" },
    previousStock: number | undefined,
    discountStarted: boolean,
    session: mongoose.ClientSession
) {
    const events: { product: mongoose.Types.ObjectId; type: "restock" | "discount"; discountPercent?: number; discountAudience?: "all" | "members" }[] = [];
    if (previousStock === 0 && product.stock > 0) events.push({ product: product._id, type: "restock" });
    if (discountStarted) events.push({ product: product._id, type: "discount", discountPercent: product.discountPercent, discountAudience: product.discountAudience || "all" });
    if (events.length) await SubscriptionEvent.create(events, { session, ordered: true });
}
