"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineShieldCheck } from "react-icons/hi2";

export default function AccountPage() {
    const { user } = useAuth();

    const initial = user?.name?.charAt(0).toUpperCase() || "U";

    return (
        <ProtectedRoute>
            <section className="min-h-screen bg-gray-50 px-4 py-12">
                <main className="mx-auto w-full max-w-3xl">

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

                                <div className="min-w-0">
                                    <p className="text-sm text-gray-500">
                                        Name
                                    </p>

                                    <p className="mt-1 truncate font-medium text-gray-900">
                                        {user?.name}
                                    </p>
                                </div>
                            </div>

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
                </main>
            </section>
        </ProtectedRoute>
    );
}