"use client";

import { useEffect, useState } from "react";
import { HiOutlineBell, HiOutlineEnvelope } from "react-icons/hi2";
import { apiRequest } from "@/lib/api";
import { SubscriptionPreferences } from "@/lib/subscription";

type SubscriptionData = {
    email: string;
    preferences: SubscriptionPreferences;
    categories: { _id: string; name: string }[];
};

export default function SubscriptionSettings() {
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [form, setForm] = useState<SubscriptionPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                const response = await apiRequest<{ data: SubscriptionData }>("/api/subscription", {
                    cache: "no-store", signal: controller.signal,
                });
                if (!controller.signal.aborted) {
                    setData(response.data);
                    setForm(response.data.preferences);
                }
            } catch (error) {
                if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load subscriptions.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [attempt]);

    const changed = data && form && JSON.stringify(data.preferences) !== JSON.stringify(form);
    const update = (changes: Partial<SubscriptionPreferences>) => {
        setForm((previous) => previous ? { ...previous, ...changes } : previous);
        setMessage("");
        setError("");
    };

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form || !data || saving) return;
        if (form.discounts && form.discountScope === "categories" && !form.categories.length) {
            setError("Select at least one category for discount emails.");
            return;
        }
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const response = await apiRequest<{ data: { preferences: SubscriptionPreferences }; message: string }>("/api/subscription", {
                method: "PUT", body: JSON.stringify(form),
            });
            setData({ ...data, preferences: response.data.preferences });
            setForm(response.data.preferences);
            setMessage(response.message);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unable to save subscriptions.");
        } finally {
            setSaving(false);
        }
    };

    const checkboxClass = "mt-0.5 h-4 w-4 shrink-0 accent-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

    return (
        <section className="flex-1 bg-gray-50 px-4 py-12">
            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                        <HiOutlineBell aria-hidden="true" className="h-7 w-7" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
                    <p className="mt-2 text-gray-500">Choose the emails you want to receive.</p>
                </div>

                {loading ? <p role="status" className="py-12 text-center text-sm text-gray-500">Loading your preferences...</p> : !data || !form ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                        <p role="alert" className="text-sm text-red-600">{error}</p>
                        <button type="button" onClick={() => { setError(""); setLoading(true); setAttempt((value) => value + 1); }} className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white">Try again</button>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-6 sm:px-8">
                            <label htmlFor="subscription-email" className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                <HiOutlineEnvelope aria-hidden="true" className="h-5 w-5" /> Registered email
                            </label>
                            <input id="subscription-email" type="email" value={data.email} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600" />
                            <p className="mt-2 text-xs text-gray-500">Updates go to your account email. This address cannot be edited here.</p>
                        </div>

                        <fieldset disabled={saving} className="divide-y divide-gray-100 disabled:opacity-60">
                            <legend className="sr-only">Email preferences</legend>
                            <div className="px-6 py-6 sm:px-8">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input type="checkbox" checked={form.wishlistRestock} onChange={(event) => update({ wishlistRestock: event.target.checked })} className={checkboxClass} />
                                    <span><span className="block text-sm font-semibold text-gray-900">Wishlist restock alerts</span><span className="mt-1 block text-sm text-gray-500">Email me when an out-of-stock item on my wishlist becomes available.</span></span>
                                </label>
                            </div>

                            <div className="px-6 py-6 sm:px-8">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input type="checkbox" checked={form.discounts} onChange={(event) => update({ discounts: event.target.checked })} className={checkboxClass} />
                                    <span><span className="block text-sm font-semibold text-gray-900">Discount alerts</span><span className="mt-1 block text-sm text-gray-500">Email me about new discounts on available products.</span></span>
                                </label>

                                {form.discounts && (
                                    <fieldset className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:ml-7">
                                        <legend className="px-1 text-sm font-medium text-gray-700">Which products?</legend>
                                        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-700">
                                            <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="discount-scope" checked={form.discountScope === "all"} onChange={() => update({ discountScope: "all" })} className="accent-black" />All categories</label>
                                            <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="discount-scope" checked={form.discountScope === "categories"} onChange={() => update({ discountScope: "categories" })} className="accent-black" />Choose categories</label>
                                        </div>
                                        {form.discountScope === "categories" && (
                                            <div className="mt-4">
                                                <label htmlFor="subscription-category-search" className="sr-only">Search categories</label>
                                                <input id="subscription-category-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black" />
                                                <p className="mt-2 text-xs text-gray-500">{form.categories.length} selected</p>
                                                <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
                                                    {data.categories.filter((category) => category.name.toLowerCase().includes(search.trim().toLowerCase())).map((category) => (
                                                        <label key={category._id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                            <input type="checkbox" checked={form.categories.includes(category._id)} onChange={(event) => update({ categories: event.target.checked ? [...form.categories, category._id] : form.categories.filter((id) => id !== category._id) })} className="h-4 w-4 shrink-0 accent-black" />
                                                            {category.name}
                                                        </label>
                                                    ))}
                                                    {!data.categories.some((category) => category.name.toLowerCase().includes(search.trim().toLowerCase())) && <p className="p-2 text-sm text-gray-500">No categories found.</p>}
                                                </div>
                                            </div>
                                        )}
                                    </fieldset>
                                )}
                            </div>

                            <div className="px-6 py-6 sm:px-8">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input type="checkbox" checked={form.cartReminder} onChange={(event) => update({ cartReminder: event.target.checked })} className={checkboxClass} />
                                    <span><span className="block text-sm font-semibold text-gray-900">Cart reminders</span><span className="mt-1 block text-sm text-gray-500">Send one reminder if items stay in my cart for two days without changes.</span></span>
                                </label>
                            </div>
                        </fieldset>

                        <div className="border-t border-gray-200 px-6 py-5 sm:px-8">
                            <p className="text-xs leading-5 text-gray-500">Updates are combined into a daily email when there is something to share. You can unsubscribe here at any time. Order confirmations and security emails are separate.</p>
                            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                            {message && <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                                <button type="button" disabled={saving || !(form.wishlistRestock || form.discounts || form.cartReminder)} onClick={() => update({ wishlistRestock: false, discounts: false, cartReminder: false })} className="text-sm text-gray-500 underline underline-offset-4 transition hover:text-black disabled:opacity-50">Uncheck all</button>
                                <div className="flex gap-3">
                                    <button type="button" disabled={saving || !changed} onClick={() => { setForm(data.preferences); setError(""); setMessage(""); }} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                                    <button type="submit" disabled={saving || !changed} className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
