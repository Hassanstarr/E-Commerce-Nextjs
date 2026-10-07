"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
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

                <div className="hidden items-center gap-5 md:flex">

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
                                className="cursor-pointer text-sm text-gray-500 transition hover:text-black"
                            >
                                Logout
                            </button>
                        </>
                    )}

                </div>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-black md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? (
                        <HiOutlineXMark className="h-6 w-6" />
                    ) : (
                        <HiOutlineBars3 className="h-6 w-6" />
                    )}
                </button>

            </nav>

            {mobileMenuOpen && (
                <div className="border-t border-gray-200 bg-white md:hidden">
                    <div className="absolute w-full bg-white px-4 py-2">

                        <Link
                            href="/products"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-3 text-sm text-gray-500 hover:text-black"
                        >
                            Products
                        </Link>

                        <Link
                            href="/categories"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-3 text-sm text-gray-500 hover:text-black"
                        >
                            Categories
                        </Link>

                        {!loading && !user && (
                            <Link
                                href="/auth/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-3 text-sm text-gray-500 hover:text-black"
                            >
                                Login
                            </Link>
                        )}

                        {!loading && user && (
                            <>
                                <Link
                                    href="/cart"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-3 text-sm text-gray-500 hover:text-black"
                                >
                                    Cart
                                </Link>

                                <Link
                                    href="/wishlist"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-3 text-sm text-gray-500 hover:text-black"
                                >
                                    Wishlist
                                </Link>

                                <Link
                                    href="/account"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-3 text-sm text-gray-500 hover:text-black"
                                >
                                    Account
                                </Link>

                                {user.role === "admin" && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-3 text-sm font-medium text-gray-500 hover:text-black"
                                    >
                                        Admin
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="block w-full cursor-pointer py-3 text-left text-sm text-gray-500 hover:text-black"
                                >
                                    Logout
                                </button>
                            </>
                        )}

                    </div>
                </div>
            )}
        </header>
    );
}