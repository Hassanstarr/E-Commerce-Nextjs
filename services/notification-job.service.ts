import mongoose from "mongoose";
import Membership from "@/models/Membership";
import NotificationJobState from "@/models/NotificationJobState";
import { queueNotification } from "@/services/notification-event.service";
import { cleanupNotifications, deliverNotificationEvents } from "@/services/notification.service";
import { syncMembershipForNotifications } from "@/services/membership.service";

export async function runNotificationJobs() {
    const state = await NotificationJobState.findOne({ key: "billing" }).lean();
    let cursor = state?.cursor || "";
    let checked = 0;
    let billingErrors = 0;
    for (let page = 0; page < 5; page++) {
        const now = new Date();
        const memberships = await Membership.find({ subscriptionId: { $exists: true }, paidUntil: { $ne: null },
            currentPeriodEnd: { $lte: new Date(now.getTime() + 3 * 86400000) },
            ...(cursor ? { _id: { $gt: new mongoose.Types.ObjectId(cursor) } } : {}),
        }).sort({ _id: 1 }).limit(50).lean();
        if (!memberships.length) { cursor = ""; break; }
        for (const previous of memberships) {
            try {
                const membership = await syncMembershipForNotifications(previous.user.toString());
                if (!membership?.subscriptionId || !membership.paidUntil || !membership.currentPeriodEnd) continue;
                const userId = membership.user.toString();
                const periodEnd = membership.currentPeriodEnd as Date;
                if (membership.paidUntil.getTime() <= Date.now()) {
                    await queueNotification({ key: `membership:${membership.subscriptionId}:${membership.paidUntil.getTime()}:ended`, type: "membership", audience: "user", userId,
                        title: "Membership ended", message: "Your paid membership period has ended. Visit Membership to review your plan or payment details.", href: "/membership" });
                    continue;
                }
                const remaining = periodEnd.getTime() - Date.now();
                if (remaining <= 0 || remaining > 3 * 86400000) continue;
                const window = remaining <= 86400000 ? "1-day" : "3-day";
                const canceled = Boolean(membership.cancelAtPeriodEnd);
                const date = periodEnd.toLocaleString("en-PK", { timeZone: "Asia/Karachi" });
                const amount = `${String(membership.currency || "pkr").toUpperCase()} ${((membership.unitAmount || 0) / 100).toLocaleString()}`;
                await queueNotification({ key: `membership:${membership.subscriptionId}:${periodEnd.getTime()}:${canceled ? "ends" : "renews"}:${window}`, type: "membership", audience: "user", userId,
                    title: canceled ? "Membership ends soon" : "Membership renews soon",
                    message: canceled ? `Your benefits end on ${date} (PKT). Automatic renewal is off.` : `Your membership is scheduled to renew on ${date} (PKT) for ${amount}.`, href: "/membership",
                    reminder: { subscriptionId: membership.subscriptionId, periodEnd: periodEnd.toISOString(), canceled } });
                checked++;
            } catch { billingErrors++; }
        }
        cursor = memberships[memberships.length - 1]._id.toString();
        if (memberships.length < 50) { cursor = ""; break; }
    }
    await NotificationJobState.updateOne({ key: "billing" }, { $set: { cursor } }, { upsert: true });
    const delivery = await deliverNotificationEvents(100);
    const removed = await cleanupNotifications();
    return { checked, billingErrors, ...delivery, removed };
}
