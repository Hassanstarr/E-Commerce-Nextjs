"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HiOutlineBars3, HiOutlineXMark, HiOutlineChevronDown, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";
import LogoutDialog from "@/components/auth/LogoutDialog";
import NotificationBell from "@/components/notifications/LiveNotificationBell";

const navigation = [
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    { href: "/cart", label: "Cart" },
    { href: "/wishlist", label: "Wishlist" },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");
    const profileRef = useRef<HTMLDetailsElement>(null);
    const mobileMenuRef = useRef<HTMLDetailsElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
    const links = user ? [...navigation, { href: "/orders", label: "My Orders" }] : navigation;

    const closeMenus = () => {
        if (mobileMenuRef.current) mobileMenuRef.current.open = false;
        if (profileRef.current) profileRef.current.open = false;
    };

    useEffect(() => {
        const handleOutsideClick = (event: PointerEvent) => {
            if (dialogRef.current?.open) return;
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                profileRef.current.open = false;
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                mobileMenuRef.current.open = false;
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (dialogRef.current?.open) return;
            if (event.key === "Escape" && profileRef.current?.open) {
                profileRef.current.open = false;
                profileRef.current.querySelector("summary")?.focus();
            }
            if (event.key === "Escape" && mobileMenuRef.current?.open) {
                mobileMenuRef.current.open = false;
                mobileMenuRef.current.querySelector("summary")?.focus();
            }
        };
        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        if (!logoutOpen) return;
        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog?.showModal();
        return () => {
            document.body.style.overflow = previousOverflow;
            dialog?.close();
        };
    }, [logoutOpen]);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        setLogoutError("");
        try {
            await logout();
            setLogoutOpen(false);
            closeMenus();
            router.push("/");
            router.refresh();
        } catch {
            setLogoutError("Unable to log out. Please try again.");
        } finally {
            setLoggingOut(false);
        }
    };

    const linkClass = (href: string) => `group relative py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900 ${isActive(href) ? "text-gray-900" : "text-gray-500 hover:text-gray-900"}`;
    const underlineClass = (href: string) => `absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-gray-900 transition-transform duration-200 motion-reduce:transition-none ${isActive(href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"}`;

    return (
        <header className="sticky top-0 z-50 shrink-0 border-b border-gray-200 bg-white">
            <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
                <Link href="/" onClick={closeMenus} className="text-xl font-bold text-gray-900">ShopEase</Link>

                <div className="hidden items-center gap-5 md:flex">
                    {links.map((item) => (
                        <Link key={item.href} href={item.href} onClick={closeMenus} aria-current={isActive(item.href) ? "page" : undefined} className={linkClass(item.href)}>
                            {item.label}
                            <span aria-hidden="true" className={underlineClass(item.href)} />
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <NotificationBell />
                    {!loading && !user && (
                        <Link href="/auth/login" className="hidden rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 md:block">Login</Link>
                    )}

                    {!loading && user && (
                        <details ref={profileRef} className="group/profile relative">
                            <summary
                                aria-label={`Open profile menu for ${user.name}`}
                                onClick={() => { if (mobileMenuRef.current) mobileMenuRef.current.open = false; }}
                                className={`flex cursor-pointer list-none items-center gap-2 rounded-full p-1 transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 [&::-webkit-details-marker]:hidden ${isActive("/account") ? "ring-2 ring-gray-900 ring-offset-2" : ""}`}
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                                    {user.name.trim().charAt(0).toUpperCase() || "U"}
                                </span>
                                <HiOutlineChevronDown aria-hidden="true" className="mr-1 h-4 w-4 text-gray-500 transition-transform group-open/profile:rotate-180" />
                            </summary>
                            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                <div className="border-b border-gray-100 px-4 py-3">
                                    <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                                    <p className="mt-1 truncate text-xs text-gray-500">{user.email}</p>
                                </div>
                                <div className="space-y-1 p-2">
                                    {[
                                        { href: "/account", label: "My Account" },
                                        ...(user.role !== "admin" ? [{ href: "/membership", label: user.role === "member" ? "My Membership" : "Membership" }] : []),
                                        { href: "/subscription", label: "Email Subscriptions" },
                                        { href: "/orders", label: "My Orders" },
                                        { href: "/chat", label: "Live Chat" },
                                        ...(user.role === "admin" ? [{ href: "/admin", label: "Admin Dashboard" }] : []),
                                    ].map((item) => (
                                        <Link key={item.href} href={item.href} onClick={closeMenus} aria-current={isActive(item.href) ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm transition ${isActive(item.href) ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-black"}`}>
                                            {item.label}
                                        </Link>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (mobileMenuRef.current) mobileMenuRef.current.open = false;
                                            setLogoutError("");
                                            setLogoutOpen(true);
                                        }}
                                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-black"
                                    >
                                        <HiOutlineArrowRightOnRectangle className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </details>
                    )}

                    <details ref={mobileMenuRef} className="group/mobile md:hidden">
                        <summary aria-label="Navigation menu" aria-controls="mobile-navigation" className="flex h-11 w-11 touch-manipulation cursor-pointer list-none items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 [&::-webkit-details-marker]:hidden">
                            <HiOutlineBars3 aria-hidden="true" className="pointer-events-none h-6 w-6 group-open/mobile:hidden" />
                            <HiOutlineXMark aria-hidden="true" className="pointer-events-none hidden h-6 w-6 group-open/mobile:block" />
                        </summary>
                        <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
                            {[...links, ...(!loading && !user ? [{ href: "/auth/login", label: "Login" }] : [])].map((item) => (
                                <div key={item.href} className="py-1">
                                    <Link href={item.href} onClick={closeMenus} aria-current={isActive(item.href) ? "page" : undefined} className={`inline-flex ${linkClass(item.href)}`}>
                                        {item.label}
                                        <span aria-hidden="true" className={underlineClass(item.href)} />
                                    </Link>
                                </div>
                            ))}
                        </nav>
                    </details>
                </div>
            </nav>

            <LogoutDialog
                dialogRef={dialogRef}
                loading={loggingOut}
                error={logoutError}
                onClose={() => setLogoutOpen(false)}
                onConfirm={handleLogout}
            />
        </header>
    );
}
