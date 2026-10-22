import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

async function main() {
    loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
    const dryRun = process.argv.includes("--dry-run");
    if (process.argv.slice(2).some((argument) => argument !== "--dry-run")) {
        throw new Error("Use --dry-run to check subscriptions without sending email.");
    }

    const { connectDB } = await import("../lib/db");
    const { subscriptionAppUrl, buildSubscriptionEmail, sendSubscriptionEmails } = await import("../services/subscription.service");
    const appUrl = subscriptionAppUrl();
    console.log(dryRun ? "Checking subscriptions without sending email..." : "Processing pending subscription emails...");
    await connectDB();

    if (!dryRun) {
        const result = await sendSubscriptionEmails();
        console.log(`Checked ${result.checked} subscriptions. Sent: ${result.sent}. Failed: ${result.failed}.`);
        if (result.failed) process.exitCode = 1;
        return;
    }

    const { default: Subscription } = await import("../models/Subscription");
    const { default: SubscriptionDelivery } = await import("../models/SubscriptionDelivery");
    const now = new Date();
    let checked = 0;
    let eligible = 0;
    let alreadySent = 0;
    let retryPending = 0;
    const subscriptions = Subscription.find({
        $or: [{ wishlistRestock: true }, { discounts: true }, { cartReminder: true }],
    }).cursor();

    for await (const subscription of subscriptions) {
        checked++;
        const message = await buildSubscriptionEmail(subscription, now, appUrl);
        if (!message.hasUpdates) continue;
        const delivery = await SubscriptionDelivery.findOne({
            user: subscription.user, version: subscription.version, day: now.toISOString().slice(0, 10),
        }).lean();
        if (delivery?.status === "sent") alreadySent++;
        else if (delivery && (delivery.leaseUntil > now || delivery.attempts >= 5)) retryPending++;
        else eligible++;
    }

    console.log(`Email credentials configured: ${Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)}.`);
    console.log(`Cron secret configured: ${Boolean(process.env.CRON_SECRET)}.`);
    console.log(`Active subscriptions: ${checked}. Ready to send: ${eligible}.`);
    console.log(`Daily limit already reached: ${alreadySent}. Waiting for delivery retry: ${retryPending}.`);
    console.log("No emails sent. No subscription preferences or delivery records changed.");
    console.log("Local development does not run Vercel cron jobs. Run npm run subscriptions:send to process pending emails.");
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Unable to process subscriptions.");
    process.exitCode = 1;
}).finally(async () => {
    await mongoose.disconnect();
});
