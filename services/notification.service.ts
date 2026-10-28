import { createHash, randomUUID } from "crypto";
import mongoose from "mongoose";
import { FieldPath, FieldValue, Timestamp } from "firebase-admin/firestore";
import { notificationFirebase } from "@/lib/firebase-admin";
import { notificationRetentionDays } from "@/lib/notification-config";
import AppError from "@/lib/AppError";
import NotificationEvent, { type INotificationEvent } from "@/models/NotificationEvent";
import User from "@/models/User";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import Membership from "@/models/Membership";
import StripeCheckout from "@/models/StripeCheckout";
import { getProductPricing } from "@/lib/product-pricing";
import { getUserRole } from "@/lib/membership";
import type { Notification, NotificationFilter, NotificationPage } from "@/types/notification";

export function notificationId(key: string, userId: string) {
    return createHash("sha256").update(`${key}:${userId}`).digest("hex");
}

function inbox(userId: string) { return notificationFirebase().db.collection("notificationInboxes").doc(userId); }
function activeItems(userId: string, now: Date) { return inbox(userId).collection("notificationItems").where("expiresAt", ">", Timestamp.fromDate(now)); }

export async function getNotifications(userId: string, filter: NotificationFilter = "all", cursor?: string): Promise<NotificationPage> {
    const now = new Date();
    const active = activeItems(userId, now);
    const unread = active.where("readAt", "==", null);
    let page = (filter === "unread" ? unread : active).orderBy("expiresAt", "desc").orderBy(FieldPath.documentId(), "desc");
    if (cursor) {
        try {
            const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString());
            if (!Number.isSafeInteger(parsed.time) || !/^[a-f\d]{64}$/.test(parsed.id)) throw new Error();
            page = page.startAfter(Timestamp.fromMillis(parsed.time), parsed.id);
        } catch { throw new AppError("Invalid notification page", 400); }
    }
    const [snapshot, count, earliest] = await Promise.all([page.limit(21).get(), unread.count().get(), active.orderBy("expiresAt", "asc").limit(1).get()]);
    const items: Notification[] = snapshot.docs.slice(0, 20).map((doc) => {
        const data = doc.data();
        return { id: doc.id, type: data.type, title: data.title, message: data.message, href: data.href,
            createdAt: data.createdAt.toDate().toISOString(), expiresAt: data.expiresAt.toDate().toISOString(), readAt: data.readAt?.toDate().toISOString() || null,
            offerEndsAt: data.offerEndsAt?.toDate().toISOString() || null, offerExpired: Boolean(data.offerEndsAt && data.offerEndsAt.toMillis() <= now.getTime()) };
    });
    const last = snapshot.docs[Math.min(snapshot.size, 20) - 1];
    const deadlines = [earliest.docs[0]?.data().expiresAt.toMillis(), ...items.map((item) => item.offerEndsAt ? new Date(item.offerEndsAt).getTime() : 0)]
        .filter((time): time is number => typeof time === "number" && time > now.getTime());
    return { items, unreadCount: count.data().count, nextCursor: snapshot.size > 20 && last ? Buffer.from(JSON.stringify({ time: last.data().expiresAt.toMillis(), id: last.id })).toString("base64url") : null,
        nextExpiry: deadlines.length ? new Date(Math.min(...deadlines)).toISOString() : null, retentionDays: notificationRetentionDays() };
}

export async function markNotificationRead(userId: string, id: string) {
    if (!/^[a-f\d]{64}$/.test(id)) throw new AppError("Invalid notification ID", 400);
    const { db } = notificationFirebase();
    const meta = inbox(userId);
    await db.runTransaction(async (transaction) => {
        const ref = meta.collection("notificationItems").doc(id);
        const snapshot = await transaction.get(ref);
        const data = snapshot.data();
        if (!data || data.expiresAt.toMillis() <= Date.now()) throw new AppError("Notification not found", 404);
        if (data.readAt) return;
        transaction.update(ref, { readAt: Timestamp.now() });
        transaction.set(meta, { version: FieldValue.increment(1) }, { merge: true });
    });
}

export async function markAllNotificationsRead(userId: string) {
    const { db } = notificationFirebase();
    const snapshot = await activeItems(userId, new Date()).where("readAt", "==", null).get();
    for (let index = 0; index < snapshot.size; index += 400) {
        const batch = db.batch();
        for (const doc of snapshot.docs.slice(index, index + 400)) batch.update(doc.ref, { readAt: Timestamp.now() });
        batch.set(inbox(userId), { version: FieldValue.increment(1) }, { merge: true });
        await batch.commit();
    }
}

async function deliverToUser(event: INotificationEvent, user: { _id: { toString(): string }; role: "user" | "member" | "admin"; memberUntil?: Date | null }) {
    if (event.expiresAt.getTime() <= Date.now()) return;
    if (event.audience === "members" && getUserRole(user) !== "member") return;
    if (event.checkoutId && !await StripeCheckout.exists({ _id: event.checkoutId, status: "failed" })) return;
    if (event.invoiceId && !await Membership.exists({ latestInvoiceId: event.invoiceId, latestInvoiceStatus: { $nin: ["paid", "void"] } })) return;
    let message = event.message;
    if (event.productId) {
        const product = await Product.findById(event.productId).lean();
        if (!product) return;
        const pricing = getProductPricing(product, Date.now(), getUserRole(user));
        if (event.type === "discount") {
            const offer = pricing.availableOffers.find((item) => item.discountAudience === event.discountAudience && item.discountPercent === event.discountPercent);
            if (!offer || (event.offerEndsAt?.getTime() || 0) !== (offer.discountEndsAt ? new Date(offer.discountEndsAt).getTime() : 0)) return;
            if (event.audience === "members" && pricing.discountAudience !== "members") return;
            message = `${product.name}: ${offer.discountPercent}% ${offer.discountAudience === "members" ? "member" : "everyone"} offer. Your current price is Rs. ${pricing.price.toLocaleString()}.`;
        } else if (event.type === "stock") {
            if (product.stock <= 0) return;
            message = `${product.name} is back in stock. View the product for current availability.`;
        } else if (event.type === "product") message = `${product.name} is now available. Your current price is Rs. ${pricing.price.toLocaleString()}.`;
    }
    if (event.reminder) {
        const membership = await Membership.findOne({ user: user._id, subscriptionId: event.reminder.subscriptionId }).lean();
        if (!membership || membership.currentPeriodEnd?.toISOString() !== event.reminder.periodEnd || membership.cancelAtPeriodEnd !== event.reminder.canceled || !membership.paidUntil || membership.paidUntil <= new Date()) return;
    }
    const { db } = notificationFirebase();
    const meta = inbox(user._id.toString());
    const ref = meta.collection("notificationItems").doc(notificationId(event.key, user._id.toString()));
    await db.runTransaction(async (transaction) => {
        if ((await transaction.get(ref)).exists) return;
        transaction.create(ref, { type: event.type, title: event.title, message, href: event.href,
            createdAt: Timestamp.fromDate(event.createdAt), expiresAt: Timestamp.fromDate(event.expiresAt), readAt: null,
            offerEndsAt: event.offerEndsAt ? Timestamp.fromDate(event.offerEndsAt) : null });
        transaction.set(meta, { version: FieldValue.increment(1) }, { merge: true });
    });
}

export async function deliverNotificationEvents(maxEvents = 20) {
    notificationFirebase();
    const report = { delivered: 0, deferred: 0 };
    for (let index = 0; index < maxEvents; index++) {
        const now = new Date();
        const token = randomUUID();
        const event = await NotificationEvent.findOneAndUpdate({ status: "pending", nextAttempt: { $lte: now }, expiresAt: { $gt: now },
            $or: [{ lockUntil: { $exists: false } }, { lockUntil: { $lte: now } }],
        }, { $set: { lockToken: token, lockUntil: new Date(now.getTime() + 120000) } }, { returnDocument: "after", sort: { createdAt: 1 } });
        if (!event) break;
        try {
            const filter: Record<string, unknown> = { createdAt: { $lte: event.createdAt } };
            if (event.audience === "user") filter._id = event.userId;
            else if (event.audience === "admins") filter.role = "admin";
            else if (event.audience === "members") { filter.role = "member"; filter.memberUntil = { $gt: new Date() }; }
            else filter.role = { $in: ["user", "member"] };
            if (event.audience === "wishlist") filter._id = { $in: await Wishlist.distinct("user", { products: event.productId }) };
            if (event.cursor) filter._id = { ...(typeof filter._id === "object" ? filter._id : filter._id ? { $eq: filter._id } : {}), $gt: new mongoose.Types.ObjectId(event.cursor) };
            if (event.excludeUserId) filter._id = { ...(typeof filter._id === "object" ? filter._id : { ...(filter._id ? { $eq: filter._id } : {}) }), $ne: new mongoose.Types.ObjectId(event.excludeUserId) };
            const users = await User.find(filter).select("role memberUntil").sort({ _id: 1 }).limit(50).lean();
            // The cursor advances only after all writes succeed. Replays preserve read state.
            await Promise.all(users.map((user) => deliverToUser(event, user)));
            await NotificationEvent.updateOne({ _id: event._id, lockToken: token }, {
                $set: { ...(users.length === 50 ? { cursor: users[49]._id.toString() } : { status: "delivered" }), nextAttempt: new Date() },
                $unset: { lockToken: "", lockUntil: "" },
            });
            report.delivered++;
        } catch {
            await NotificationEvent.updateOne({ _id: event._id, lockToken: token }, { $inc: { attempts: 1 },
                $set: { nextAttempt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** Math.min(event.attempts, 7))) }, $unset: { lockToken: "", lockUntil: "" } });
            report.deferred++;
        }
    }
    return report;
}

export async function cleanupNotifications() {
    const { db } = notificationFirebase();
    let removed = 0;
    // Bound each scheduled invocation; the next run continues any backlog.
    for (let page = 0; page < 10; page++) {
        const expired = await db.collectionGroup("notificationItems").where("expiresAt", "<=", Timestamp.now()).limit(200).get();
        if (expired.empty) break;
        const batch = db.batch();
        const parents = new Map<string, FirebaseFirestore.DocumentReference>();
        for (const doc of expired.docs) {
            if (doc.ref.parent.parent?.parent.id !== "notificationInboxes") continue;
            batch.delete(doc.ref);
            parents.set(doc.ref.parent.parent.path, doc.ref.parent.parent);
            removed++;
        }
        for (const ref of parents.values()) batch.set(ref, { version: FieldValue.increment(1) }, { merge: true });
        await batch.commit();
        if (expired.size < 200) break;
    }
    const sessions = await db.collection("notificationSessions").where("expiresAt", "<=", Timestamp.now()).limit(200).get();
    if (!sessions.empty) { const batch = db.batch(); sessions.docs.forEach((doc) => batch.delete(doc.ref)); await batch.commit(); }
    return removed;
}
