"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <section className="min-h-155 bg-gray-50">
                <main className="mx-auto max-w-4xl px-4 py-12 ">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Account
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Manage your account information.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Name
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {user?.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Email
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {user?.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Role
                                </p>

                                <p className="mt-1 font-medium capitalize text-gray-900">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </section>
        </ProtectedRoute>
    );
}