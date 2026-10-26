import { randomUUID } from "crypto";
import mongoose from "mongoose";
import type Stripe from "stripe";
import Membership from "@/models/Membership";
import User from "@/models/User";
import AppError from "@/lib/AppError";
import { getStripe } from "@/lib/stripe";
import { membershipPlan } from "@/lib/membership";
import type { MembershipData } from "@/types/membership";

const requestOptions = { timeout: 15000, maxNetworkRetries: 0 };
const endedStatuses = ["canceled", "incomplete_expired"];
const idOf = (value: string | { id: string } | null) => typeof value === "string" ? value : value?.id;

function membershipPriceError(reason: string) {
    console.error(`Membership pricing configuration: ${reason}`);
    return new AppError("Membership is temporarily unavailable. Please contact our store team.", 503);
}

export async function getMembershipPlan() {
    const priceId = process.env.STRIPE_MEMBERSHIP_PRICE_ID?.trim();
    if (!priceId) {
        const unitAmount = Math.round(membershipPlan.monthlyPrice * 100);
        if (!Number.isSafeInteger(unitAmount) || unitAmount < 1 || unitAmount > 99999999) throw membershipPriceError("Configure a valid monthly membership amount.");
        return { name: membershipPlan.name, unitAmount, currency: membershipPlan.currency };
    }
    if (!/^price_[a-zA-Z0-9]+$/.test(priceId)) {
        throw membershipPriceError("STRIPE_MEMBERSHIP_PRICE_ID must be a Price ID (price_), not a Product ID (prod_).");
    }
    let price;
    try {
        price = await getStripe().prices.retrieve(priceId, {}, requestOptions);
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "resource_missing") {
            throw membershipPriceError("Price not found. Check that the Price ID and API key use the same test or live environment.");
        }
        throw error;
    }
    if (!price.active || price.type !== "recurring" || price.recurring?.interval !== "month" || price.recurring.interval_count !== 1
        || price.currency !== membershipPlan.currency || price.recurring.usage_type === "metered" || price.billing_scheme !== "per_unit" || !price.unit_amount || price.unit_amount < 1) {
        throw membershipPriceError("Use an active, fixed monthly Stripe price in the configured currency.");
    }
    return { name: membershipPlan.name, unitAmount: price.unit_amount, currency: price.currency };
}

async function withMembership(userId: string, action: (membership: InstanceType<typeof Membership>) => Promise<void>) {
    await Membership.init();
    try {
        await Membership.updateOne({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true });
    } catch (error) {
        if (!(error instanceof mongoose.mongo.MongoServerError) || error.code !== 11000) throw error;
    }
    const token = randomUUID();
    const membership = await Membership.findOneAndUpdate({ user: userId,
        $or: [{ lockUntil: { $exists: false } }, { lockUntil: { $lte: new Date() } }],
    }, { $set: { lockToken: token, lockUntil: new Date(Date.now() + 90000) } }, { returnDocument: "after" });
    if (!membership) throw new AppError("Your membership is being updated. Please try again in a moment.", 409);
    try {
        await action(membership);
    } finally {
        await Membership.updateOne({ _id: membership._id, lockToken: token }, { $unset: { lockUntil: "", lockToken: "" } });
    }
}

// Called while the customer lock is held. Always retrieve current Stripe state, not an event snapshot.
async function syncSubscription(membership: InstanceType<typeof Membership>, subscriptionId: string) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] }, requestOptions);
    if (subscription.metadata.membershipId !== membership.id || subscription.metadata.userId !== membership.user.toString()
        || idOf(subscription.customer) !== membership.customerId) {
        throw new AppError("Subscription does not match this membership.", 400);
    }
    if (membership.subscriptionId && membership.subscriptionId !== subscription.id
        && subscription.metadata.attemptId !== membership.attemptId) return;
    const item = subscription.items.data[0];
    if (subscription.items.data.length !== 1 || !item || item.quantity !== 1 || item.price.recurring?.interval !== "month"
        || item.price.recurring.interval_count !== 1) throw new AppError("Unexpected membership plan.", 400);

    const invoice = subscription.latest_invoice && typeof subscription.latest_invoice !== "string" ? subscription.latest_invoice : null;
    const paidLine = invoice?.lines.data.find((line) => line.parent?.subscription_item_details?.subscription_item === item.id);
    const periodEnd = new Date(item.current_period_end * 1000);
    let paidUntil = membership.paidUntil as Date | undefined;
    if (subscription.status === "active" && !subscription.pause_collection && invoice?.status === "paid" && invoice.amount_paid > 0 && paidLine) {
        paidUntil = new Date(Math.min(paidLine.period.end, item.current_period_end) * 1000);
    }
    if (endedStatuses.includes(subscription.status) || subscription.status === "unpaid" || subscription.status === "paused" || subscription.pause_collection) paidUntil = undefined;
    const active = Boolean(paidUntil && paidUntil.getTime() > Date.now());
    const changes = {
        subscriptionId: subscription.id, status: subscription.status,
        currentPeriodEnd: periodEnd, paidUntil: paidUntil || null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || Boolean(subscription.cancel_at),
        unitAmount: item.price.unit_amount, currency: item.price.currency, priceId: item.price.id,
        invoiceUrl: invoice?.hosted_invoice_url || null,
    };
    await mongoose.connection.transaction(async (session) => {
        const saved = await Membership.updateOne({ _id: membership._id, lockToken: membership.lockToken, lockUntil: { $gt: new Date() } }, {
            $set: changes,
        }, { session });
        if (!saved.matchedCount) throw new AppError("Membership changed during the request. Please retry.", 409);
        await User.updateOne({ _id: membership.user, role: { $ne: "admin" } }, {
            $set: { role: active ? "member" : "user", memberUntil: paidUntil || null },
        }, { session });
    });
    Object.assign(membership, changes);
}

async function syncCheckout(membership: InstanceType<typeof Membership>, checkoutId: string) {
    const checkout = await getStripe().checkout.sessions.retrieve(checkoutId, {}, requestOptions);
    if (checkout.mode !== "subscription" || checkout.client_reference_id !== membership.user.toString()
        || checkout.metadata?.membershipId !== membership.id || idOf(checkout.customer) !== membership.customerId
        || checkout.id !== membership.checkoutId) throw new AppError("Membership checkout not found.", 404);
    const subscriptionId = idOf(checkout.subscription);
    if (subscriptionId) await syncSubscription(membership, subscriptionId);
    return checkout;
}

export async function getMembership(userId: string, checkoutId?: string): Promise<MembershipData> {
    const plan = await getMembershipPlan();
    await withMembership(userId, async (membership) => {
        if (checkoutId) await syncCheckout(membership, checkoutId);
        else if (membership.subscriptionId) await syncSubscription(membership, membership.subscriptionId);
        else if (membership.checkoutId) await syncCheckout(membership, membership.checkoutId);
    });
    const membership = await Membership.findOne({ user: userId }).lean();
    return { plan, subscription: {
        status: membership?.status || "none",
        active: Boolean(membership?.paidUntil && membership.paidUntil.getTime() > Date.now()),
        cancelAtPeriodEnd: membership?.cancelAtPeriodEnd || false,
        paidUntil: membership?.paidUntil?.toISOString() || null,
        currentPeriodEnd: membership?.currentPeriodEnd?.toISOString() || null,
        unitAmount: membership?.unitAmount ?? null, currency: membership?.currency || null,
        invoiceUrl: membership?.invoiceUrl || null,
    } };
}

export async function createMembershipCheckout(userId: string, appUrl: string) {
    const plan = await getMembershipPlan();
    let url = "";
    await withMembership(userId, async (membership) => {
        const user = await User.findById(userId).select("name email role");
        if (!user || user.role === "admin") throw new AppError("Membership is available to customer accounts only.", 403);
        if (membership.checkoutId) {
            const checkout = await syncCheckout(membership, membership.checkoutId);
            if (checkout.status === "open" && checkout.url) { url = checkout.url; return; }
        }
        if (membership.subscriptionId) await syncSubscription(membership, membership.subscriptionId);
        if (membership.subscriptionId && !endedStatuses.includes(membership.status)) {
            throw new AppError("You already have a subscription. Manage it below instead of subscribing again.", 409);
        }
        if (!membership.customerId) {
            const customer = await getStripe().customers.create({ email: user.email, name: user.name,
                metadata: { userId, membershipId: membership.id },
            }, { ...requestOptions, idempotencyKey: `membership-customer-${membership.id}` });
            membership.customerId = customer.id;
            await membership.save();
        }
        // Recover a subscription even if Checkout succeeded while its webhook/response was interrupted.
        for await (const subscription of getStripe().subscriptions.list({ customer: membership.customerId, status: "all", limit: 100 }, requestOptions)) {
            if (subscription.metadata.membershipId === membership.id && !endedStatuses.includes(subscription.status)) {
                membership.subscriptionId = subscription.id;
                await syncSubscription(membership, subscription.id);
                throw new AppError("You already have a subscription. Refresh to manage it.", 409);
            }
        }
        const reuseAttempt = membership.attemptId && !membership.checkoutId && membership.attemptAt?.getTime() > Date.now() - 32 * 60000;
        if (!reuseAttempt) {
            membership.attemptId = randomUUID();
            membership.attemptAt = new Date();
            membership.priceId = process.env.STRIPE_MEMBERSHIP_PRICE_ID?.trim() || undefined;
            membership.unitAmount = plan.unitAmount;
            membership.currency = plan.currency;
            membership.checkoutId = undefined;
            await membership.save();
        }
        const metadata = { userId, membershipId: membership.id, attemptId: membership.attemptId };
        const checkout = await getStripe().checkout.sessions.create({
            mode: "subscription", allowed_payment_method_types: ["card"], customer: membership.customerId,
            client_reference_id: userId, metadata, subscription_data: { metadata },
            line_items: [{ quantity: 1, ...(membership.priceId ? { price: membership.priceId } : {
                price_data: { currency: membership.currency, unit_amount: membership.unitAmount,
                    recurring: { interval: "month" }, product_data: { name: membershipPlan.name } },
            }) }],
            expires_at: Math.floor(membership.attemptAt.getTime() / 1000) + 1860,
            success_url: `${appUrl}/membership?checkout={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/membership?cancelled=1`,
        }, { ...requestOptions, idempotencyKey: `membership-checkout-${membership.attemptId}` });
        membership.checkoutId = checkout.id;
        await membership.save();
        if (!checkout.url) throw new AppError("Unable to open membership checkout.", 502);
        url = checkout.url;
    });
    return { url };
}

export async function cancelMembership(userId: string) {
    await withMembership(userId, async (membership) => {
        if (!membership.subscriptionId && membership.checkoutId) await syncCheckout(membership, membership.checkoutId);
        if (!membership.subscriptionId) throw new AppError("No membership subscription found.", 404);
        await syncSubscription(membership, membership.subscriptionId);
        if (endedStatuses.includes(membership.status) || membership.cancelAtPeriodEnd) return;
        if (membership.status === "incomplete") await getStripe().subscriptions.cancel(membership.subscriptionId, {}, requestOptions);
        else await getStripe().subscriptions.update(membership.subscriptionId, { cancel_at_period_end: true }, requestOptions);
        await syncSubscription(membership, membership.subscriptionId);
    });
}

export async function handleMembershipEvent(event: Stripe.Event) {
    let subscriptionId: string | undefined;
    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "customer.subscription.paused", "customer.subscription.resumed"].includes(event.type)) {
        subscriptionId = (event.data.object as Stripe.Subscription).id;
    } else if (["invoice.paid", "invoice.payment_failed", "invoice.payment_action_required"].includes(event.type)) {
        subscriptionId = idOf((event.data.object as Stripe.Invoice).parent?.subscription_details?.subscription || null);
    } else if (event.type === "checkout.session.completed") {
        const checkout = event.data.object as Stripe.Checkout.Session;
        if (checkout.mode === "subscription") subscriptionId = idOf(checkout.subscription);
    } else return false;
    if (!subscriptionId) return true;
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {}, requestOptions);
    const membershipId = subscription.metadata.membershipId;
    if (!membershipId || !mongoose.isObjectIdOrHexString(membershipId)) return true;
    const membership = await Membership.findById(membershipId);
    if (!membership) return true;
    await withMembership(membership.user.toString(), async (current) => { await syncSubscription(current, subscriptionId!); });
    return true;
}
