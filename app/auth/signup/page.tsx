"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

type SignupResponse = {
    success: boolean;
    message: string;
    data: {
        user: {
            id: string;
            name: string;
            email: string;
            role: "user" | "admin";
        };
    };
};

export default function SignupPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = ( event: React.ChangeEvent<HTMLInputElement> ) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async ( event: React.FormEvent<HTMLFormElement> ) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await apiRequest<SignupResponse>("/api/auth/signup", {
                method: "POST",
                body: JSON.stringify(formData),
            });

            await refreshUser();

            router.push("/auth/login");
            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to create account"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                
                <div className="relative mb-4 flex min-h-12 items-center justify-center">
                    <Link
                        href="/"
                        className="absolute left-0 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-black"
                    >
                        <span aria-hidden="true">←</span>
                        Home
                    </Link>

                    <h1 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
                        Create Account
                    </h1>
                </div>

                <p className="-mt-5 mb-8 text-center text-sm text-gray-500">
                    Create your ShopEase account
                </p>

                
                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                
                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="font-medium text-black hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </section>
    );
}