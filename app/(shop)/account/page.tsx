"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccountEditor from "@/components/account/AccountEditor";
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineShieldCheck, HiOutlineShoppingBag, HiOutlineArrowRight, HiOutlineLockClosed } from "react-icons/hi2";

export default function AccountPage() {
    const { user } = useAuth();
    const [editor, setEditor] = useState<"name" | "password" | null>(null);

    const initial = user?.name?.charAt(0).toUpperCase() || "U";

    return (
        <ProtectedRoute>
            <section className="flex-1 bg-gray-50 px-4 py-12">
                <div className="mx-auto w-full max-w-3xl">

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-black text-2xl font-bold text-white shadow-sm">
                            {initial}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            My Account
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Manage your account information.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-200 px-6 py-5 sm:px-8">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Account Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Your personal account details.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-100">

                            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                    <HiOutlineUser className="h-5 w-5 text-gray-600" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-500">
                                        Name
                                    </p>

                                    <p className="mt-1 truncate font-medium text-gray-900">
                                        {user?.name}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditor("name")}
                                    disabled={editor !== null}
                                    aria-expanded={editor === "name"}
                                    aria-controls="account-name-editor"
                                    className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    {editor === "name" ? "Editing" : "Edit name"}
                                </button>
                            </div>

                            {editor === "name" && user && (
                                <AccountEditor key={`name-${user.id}`} user={user} mode="name" onClose={() => setEditor(null)} />
                            )}

                            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                    <HiOutlineEnvelope className="h-5 w-5 text-gray-600" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>

                                    <p className="mt-1 truncate font-medium text-gray-900">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                    <HiOutlineLockClosed className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-gray-500">Password</p>
                                    <p className="mt-1 text-sm text-gray-700">
                                        {user?.hasPassword === false ? "You use Google to sign in. No password is set." : "Update your password securely."}
                                    </p>
                                </div>
                                {user?.hasPassword !== false && (
                                    <button
                                        type="button"
                                        onClick={() => setEditor("password")}
                                        disabled={editor !== null}
                                        aria-expanded={editor === "password"}
                                        aria-controls="account-password-editor"
                                        className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {editor === "password" ? "Editing" : "Change"}
                                    </button>
                                )}
                            </div>

                            {editor === "password" && user && (
                                <AccountEditor key={`password-${user.id}`} user={user} mode="password" onClose={() => setEditor(null)} />
                            )}

                            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                    <HiOutlineShieldCheck className="h-5 w-5 text-gray-600" />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Account Role
                                    </p>

                                    <span className="mt-1 inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/orders"
                        className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:border-gray-400 sm:px-8"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <HiOutlineShoppingBag className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-gray-900">My Orders</h2>
                            <p className="mt-1 text-sm text-gray-500">View your past orders and their status.</p>
                        </div>
                        <HiOutlineArrowRight className="h-5 w-5 text-gray-500" />
                    </Link>
                </div>
            </section>
        </ProtectedRoute>
    );
}
