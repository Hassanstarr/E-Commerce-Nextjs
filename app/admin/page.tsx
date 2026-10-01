"use client";

import AdminRoute from "@/components/auth/AdminRoute";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
    const { user } = useAuth();

    return (
        <AdminRoute>
            <section className="min-h-155 bg-gray-50"> 
                <main className="mx-auto max-w-7xl px-4 py-12">
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
                                Manage User.
                            </p>
                        </div>
                    </div>
                </main>
            </section>
        </AdminRoute>
    );
}