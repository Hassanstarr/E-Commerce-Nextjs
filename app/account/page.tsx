"use client";

import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <section className="flex min-h-[70vh] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading account...
                </p>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Please login
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        You need to login to view your account.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Account
                    </h1>

                    <div className="mt-8 space-y-5">
                        <div>
                            <p className="text-sm text-gray-500">
                                Name
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {user.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Email
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Account Type
                            </p>

                            <p className="mt-1 font-medium capitalize text-gray-900">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}