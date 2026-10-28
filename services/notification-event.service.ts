import type mongoose from "mongoose";
import { waitUntil } from "@vercel/functions";
import NotificationEvent, { type NotificationEventInput } from "@/models/NotificationEvent";
import { notificationExpiry } from "@/lib/notification-config";

export async function queueNotification(input: NotificationEventInput, session?: mongoose.ClientSession) {
    const now = new Date();
    await NotificationEvent.updateOne({ key: input.key }, { $setOnInsert: {
        ...input, createdAt: now, expiresAt: notificationExpiry(now), status: "pending", cursor: "", nextAttempt: now,
    } }, { upsert: true, session, timestamps: false });
}

export function dispatchNotifications() {
    if (process.env.NODE_ENV === "test") return;
    const delivery = import("@/services/notification.service").then((service) => service.deliverNotificationEvents())
        .catch(() => { console.error("Notification delivery deferred; pending events will be retried."); });
    try { waitUntil(delivery); } catch { /* Persistent local and chat servers finish the same promise. */ }
}

export async function queueOrderNotifications(order: { _id: { toString(): string }; user?: { toString(): string }; total: number }, session: mongoose.ClientSession) {
    if (order.user) await queueNotification({ key: `order:${order._id}:created:customer`, type: "order", audience: "user", userId: order.user.toString(),
        title: "Order received", message: `Your order has been placed. Total: Rs. ${order.total.toLocaleString()}.`, href: "/orders" }, session);
    await queueNotification({ key: `order:${order._id}:created:admin`, type: "order", audience: "admins",
        title: "New order", message: `A new order worth Rs. ${order.total.toLocaleString()} needs your attention.`, href: `/admin/orders/${order._id}` }, session);
}

export async function queueStockNotifications(product: { _id: { toString(): string }; name?: string; stock: number }, previousStock: number | undefined, session: mongoose.ClientSession) {
    if (previousStock === undefined || previousStock === product.stock) return;
    const key = `stock:${product._id}:${Date.now()}:${product.stock}`;
    if (previousStock === 0 && product.stock > 0) await queueNotification({ key: `${key}:restock`, type: "stock", audience: "wishlist", productId: product._id.toString(),
        title: "Back in stock", message: "An item in your wishlist is available again.", href: `/products/${product._id}` }, session);
    if ((previousStock > 5 && product.stock <= 5) || (previousStock > 0 && product.stock === 0)) await queueNotification({ key: `${key}:admin`, type: "stock", audience: "admins",
        title: product.stock === 0 ? "Product out of stock" : "Low stock", message: `${product.name || "A product"} has ${product.stock} item(s) remaining.`, href: `/admin/products/${product._id}/edit` }, session);
}

export async function queueChatNotification(conversation: { _id: { toString(): string }; user: { toString(): string }; adminReadSequence: number; userReadSequence: number }, sender: "user" | "admin" | "bot", session: mongoose.ClientSession) {
    const admin = sender === "user";
    await queueNotification({ key: `chat:${conversation._id}:${admin ? "admin" : "customer"}:${admin ? conversation.adminReadSequence : conversation.userReadSequence}`,
        type: "chat", audience: admin ? "admins" : "user", ...(admin ? {} : { userId: conversation.user.toString() }),
        title: admin ? "New customer message" : "New support reply", message: admin ? "A customer has unread messages in live chat." : "You have unread messages from support.",
        href: admin ? `/admin/chats?conversation=${conversation._id}` : "/chat" }, session);
}
