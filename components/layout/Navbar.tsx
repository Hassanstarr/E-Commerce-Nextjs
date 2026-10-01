"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push("/");
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link
                    href="/"
                    className="text-xl font-bold text-gray-900"
                >
                    ShopEase
                </Link>

                <div className="flex items-center gap-5">
                    <Link
                        href="/products"
                        className="text-sm text-gray-500 transition hover:text-black"
                    >
                        Products
                    </Link>

                    <Link
                        href="/categories"
                        className="text-sm text-gray-500 transition hover:text-black"
                    >
                        Categories
                    </Link>

                    {!loading && !user && (
                        <Link
                            href="/auth/login"
                            className="text-sm text-gray-500 transition hover:text-black"
                        >
                            Login
                        </Link>
                    )}

                    {!loading && user && (
                        <>
                            <Link
                                href="/cart"
                                className="text-sm text-gray-500 transition hover:text-black"
                            >
                                Cart
                            </Link>

                            <Link
                                href="/wishlist"
                                className="text-sm text-gray-500 transition hover:text-black"
                            >
                                Wishlist
                            </Link>

                            <Link
                                href="/account"
                                className="text-sm text-gray-500 transition hover:text-black"
                            >
                                Account
                            </Link>

                            {user.role === "admin" && (
                                <Link
                                    href="/admin"
                                    className="text-sm font-medium text-gray-500 transition hover:text-black"
                                >
                                    Admin
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="text-sm text-gray-500 transition hover:text-black hover:cursor-pointer"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}