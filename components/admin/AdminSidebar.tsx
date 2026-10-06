"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    HiOutlineChartBar,
    HiOutlineClipboardDocumentList,
    HiOutlineCube,
    HiOutlineTag,
    HiOutlineUsers,
    HiOutlinePresentationChartLine,
    HiOutlineClock,
    HiOutlineBuildingStorefront,
    HiOutlineXMark,
} from "react-icons/hi2";

const navigationItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: HiOutlineChartBar,
    },
    {
        label: "Products",
        href: "/admin/products",
        icon: HiOutlineCube,
    },
    {
        label: "Categories",
        href: "/admin/categories",
        icon: HiOutlineTag,
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: HiOutlineClipboardDocumentList,
    },
    {
        label: "Customers",
        href: "/admin/customers",
        icon: HiOutlineUsers,
    },
    {
        label: "Analytics",
        href: "/admin/analytics",
        icon: HiOutlinePresentationChartLine,
    },
    {
        label: "Activity",
        href: "/admin/activity",
        icon: HiOutlineClock,
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => {
            setMobileOpen((current) => !current);
        };

        const handleClose = () => {
            setMobileOpen(false);
        };

        window.addEventListener("admin-sidebar-toggle", handleToggle);
        window.addEventListener("admin-sidebar-close", handleClose);

        return () => {
            window.removeEventListener(
                "admin-sidebar-toggle",
                handleToggle
            );

            window.removeEventListener(
                "admin-sidebar-close",
                handleClose
            );
        };
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(href);
    };

    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close admin sidebar"
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-black/30 md:hidden"
                />
            )}

            <aside
                className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white transition-transform duration-200 md:sticky md:top-16 md:z-30 md:block md:h-[calc(100vh-4rem)] md:translate-x-0 ${
                    mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <div className="flex h-full flex-col">


                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 md:hidden">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                ShopEase
                            </p>

                            <h2 className="text-lg font-semibold text-gray-900">
                                Admin Panel
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
                            aria-label="Close sidebar"
                        >
                            <HiOutlineXMark className="h-5 w-5" />
                        </button>
                    </div>


                    <nav className="flex-1 overflow-y-auto px-3 py-5">

                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Management
                        </p>

                        <div className="space-y-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                            active
                                                ? "bg-black text-white"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 shrink-0" />

                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="my-6 border-t border-gray-100" />

                        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Store
                        </p>

                        <Link
                            href="/"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                            <HiOutlineBuildingStorefront className="h-5 w-5 shrink-0" />

                            <span>View Store</span>
                        </Link>
                    </nav>


                    <div className="border-t border-gray-100 p-4">
                        <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-400">
                                Admin Panel
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                ShopEase Management
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}