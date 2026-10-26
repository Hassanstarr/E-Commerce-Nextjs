"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMembership, startMembership, cancelMembership } from "@/services/membership.api";
import type { MembershipData } from "@/types/membership";

export default function MembershipSettings() {
    const { user, refreshUser } = useAuth();
    const [data, setData] = useState<MembershipData | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);

    const load = useCallback(async (checkoutId?: string) => {
        const response = await getMembership(checkoutId);
        setData(response.data);
        return response.data;
    }, []);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const params = new URLSearchParams(window.location.search);
        const checkoutId = params.get("checkout") || undefined;
        let attempts = 0;
        const check = async () => {
            try {
                const response = await getMembership(checkoutId);
                if (cancelled) return;
                setData(response.data);
                setError("");
                setLoading(false);
                if (checkoutId && !response.data.subscription.active && attempts++ < 8) {
                    setNotice("Confirming your membership payment…");
                    timer = setTimeout(check, 3000);
                } else if (checkoutId) {
                    setNotice(response.data.subscription.active ? "Your membership is active. Welcome!" : "Payment is not confirmed yet. Refresh your membership status in a moment.");
                    if (response.data.subscription.active) window.history.replaceState(null, "", "/membership");
                } else if (params.has("cancelled")) setNotice("Checkout was closed. You can continue subscribing whenever you’re ready.");
            } catch (loadError) {
                if (cancelled) return;
                if (checkoutId && attempts++ < 8) timer = setTimeout(check, 3000);
                else { setError(loadError instanceof Error ? loadError.message : "Unable to load membership."); setLoading(false); }
            }
        };
        void check();
        return () => { cancelled = true; if (timer) clearTimeout(timer); };
    }, []);

    const membershipActive = data?.subscription.active;
    useEffect(() => {
        if (membershipActive !== undefined) void refreshUser();
    }, [membershipActive, refreshUser]);

    const handleSubscribe = async () => {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            const response = await startMembership();
            window.location.assign(response.data.url);
        } catch (subscribeError) {
            setError(subscribeError instanceof Error ? subscribeError.message : "Unable to start membership.");
            setBusy(false);
        }
    };

    const handleCancel = async () => {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            await cancelMembership();
            const updated = await load();
            setConfirmCancel(false);
            setNotice(updated.subscription.active ? "Renewal cancelled. Your membership stays active until the end of your paid period." : "Subscription cancellation confirmed. Any existing unpaid invoice may still need attention.");
        } catch (cancelError) {
            setError(cancelError instanceof Error ? cancelError.message : "Unable to cancel renewal.");
        } finally { setBusy(false); }
    };

    const subscription = data?.subscription;
    const existing = subscription && !["none", "canceled", "incomplete_expired"].includes(subscription.status);
    const amount = existing ? subscription.unitAmount : data?.plan.unitAmount;
    const currency = existing ? subscription.currency : data?.plan.currency;
    const price = amount != null && currency ? new Intl.NumberFormat("en-PK", { style: "currency", currency: currency.toUpperCase(), maximumFractionDigits: 2 }).format(amount / 100) : "";
    const date = (value: string | null) => value ? new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) : "—";

    const handleRefresh = async () => {
        if (busy) return;
        setBusy(true);
        setError("");
        try { await load(); }
        catch (refreshError) { setError(refreshError instanceof Error ? refreshError.message : "Unable to load membership."); }
        finally { setBusy(false); setLoading(false); }
    };

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Choose your plan</h1>
                <p className="mt-2 text-sm text-gray-500">Stay on Free or become a ShopEase Member.</p>
                <p className="mt-2 break-all text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2" aria-busy={loading}>
                <section className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="free-plan">
                    <div className="flex min-h-7 items-center justify-between gap-3">
                        <h2 id="free-plan" className="text-lg font-semibold text-gray-900">Free</h2>
                        {data && !subscription?.active && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Current plan</span>}
                    </div>
                    <p className="mt-5 text-3xl font-bold text-gray-900">Rs. 0<span className="ml-1 text-sm font-normal text-gray-500">/ month</span></p>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-gray-500">Your regular ShopEase account. No monthly payment.</p>
                    <p className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-400">Included</p>
                    <ul className="mb-8 mt-3 space-y-3 text-sm text-gray-700"><li className="flex items-center gap-2"><span aria-hidden="true" className="font-semibold text-gray-900">✓</span>User</li></ul>
                    <button type="button" onClick={() => setConfirmCancel(true)} disabled={!data || busy || !subscription?.active || subscription.cancelAtPeriodEnd}
                        className="mt-auto w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-default disabled:bg-gray-50 disabled:text-gray-400">
                        {!data ? "Free plan" : subscription?.active ? subscription.cancelAtPeriodEnd ? "Free after your paid period" : "Switch to Free" : "Current plan"}
                    </button>
                </section>
                <section className="flex flex-col rounded-2xl border-2 border-gray-900 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="member-plan">
                    <div className="flex min-h-7 items-center justify-between gap-3">
                        <h2 id="member-plan" className="text-lg font-semibold text-gray-900">Member</h2>
                        {subscription?.active && <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">{subscription.cancelAtPeriodEnd ? "Ending soon" : "Current plan"}</span>}
                    </div>
                    <p className="mt-5 text-3xl font-bold text-gray-900">{price || (loading ? "Loading…" : "Unavailable")}<span className="ml-1 text-sm font-normal text-gray-500">/ month</span></p>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-gray-500">{existing ? "Your monthly membership. Cancel renewal whenever you choose." : price ? `Pay ${price} today for your first month. Renews monthly unless you cancel.` : "Pay by card for your first month. Renews monthly unless you cancel."}</p>
                    <p className="mt-6 text-xs font-medium uppercase tracking-wide text-gray-400">Included</p>
                    <ul className="mb-8 mt-3 space-y-3 text-sm text-gray-700"><li className="flex items-center gap-2"><span aria-hidden="true" className="font-semibold text-gray-900">✓</span>Member</li></ul>
                    {existing && !subscription?.active && subscription?.invoiceUrl ? <a href={subscription.invoiceUrl} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-black">Complete payment</a> :
                        <button type="button" onClick={existing ? handleRefresh : handleSubscribe} disabled={!data || busy || subscription?.active}
                            className="mt-auto w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-default disabled:opacity-50">
                            {busy ? "Please wait…" : subscription?.active ? "Current plan" : existing ? "Check payment status" : "Subscribe with card"}
                        </button>}
                </section>
            </div>
            {loading && <p className="mt-5 text-center text-sm text-gray-500" role="status">Loading membership…</p>}
            {data && existing && <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-gray-900">Your membership</h2>
                {subscription?.active ? <p className="mt-2 text-sm leading-6 text-gray-600">{subscription.cancelAtPeriodEnd ? `You stay a Member until ${date(subscription.paidUntil)}. After that, your account returns to Free and won’t renew.` : `Next renewal: ${date(subscription.currentPeriodEnd)}. Your saved card will be charged ${price}.`}</p> : <p className="mt-2 text-sm leading-6 text-gray-600">Your payment needs attention. Complete payment through Stripe to activate membership.</p>}
                <div className="mt-4 flex flex-wrap gap-4">
                    {!subscription?.cancelAtPeriodEnd && <button type="button" onClick={() => setConfirmCancel(true)} disabled={busy} className="text-sm font-medium text-gray-600 underline underline-offset-4 disabled:opacity-50">Cancel renewal</button>}
                    {subscription?.invoiceUrl && <a href={subscription.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 underline underline-offset-4">View Stripe invoice</a>}
                    <button type="button" disabled={busy} onClick={handleRefresh} className="text-sm text-gray-500 underline underline-offset-4 disabled:opacity-50">Refresh status</button>
                </div>
            </div>}
            {confirmCancel && <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5" role="group" aria-label="Confirm cancellation">
                <p className="text-sm font-medium text-gray-900">Switch to Free after your paid month?</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">{subscription?.active ? `You’ll remain a Member until ${date(subscription.paidUntil)}. Cancelling stops the next renewal; it does not refund this month.` : "Future renewals will stop. An existing unpaid invoice may still be due."}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={handleCancel} disabled={busy} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? "Cancelling…" : "Confirm cancellation"}</button>
                    <button type="button" onClick={() => setConfirmCancel(false)} disabled={busy} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Keep membership</button>
                </div>
            </div>}
            {notice && <p className="mt-5 text-sm text-gray-600" role="status">{notice}</p>}
            {error && <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-sm" role="alert"><p className="text-red-700">{error}</p><button type="button" disabled={busy} onClick={handleRefresh} className="font-medium text-gray-900 underline underline-offset-4 disabled:opacity-50">{busy ? "Retrying…" : "Try again"}</button></div>}
            <p className="mt-6 text-center text-sm text-gray-500">Looking for product alerts? <Link href="/subscription" className="font-medium text-gray-900 underline underline-offset-4">Manage email subscriptions</Link></p>
        </div>
    );
}
