"use client";

import AdminRoute from "@/components/auth/AdminRoute";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
    const { user } = useAuth();

    return (
        <AdminRoute>
            <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <main className="w-full max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Admin Dashboard
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Welcome back, {user?.name}.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Products
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Manage your store products.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Categories
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Manage product categories.
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Users
                            </h2>

                            <p className="mt-2 text-sm text-gray-600">
                                Manage users.
                            </p>
                        </div>
                    </div>
                </main>
            </section>
        </AdminRoute>
    );
}