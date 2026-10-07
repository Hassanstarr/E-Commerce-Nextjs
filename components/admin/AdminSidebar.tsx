"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    HiOutlineChartBar,
    HiOutlineClipboardDocumentList,
    HiOutlineCube,
    HiOutlineTag,
    HiOutlineUsers,
    HiOutlinePresentationChartLine,
    HiOutlineClock,
    HiOutlineBuildingStorefront,
    HiOutlineArrowRightOnRectangle,
    HiOutlineXMark,
} from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";

interface AdminSidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

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

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const isActive = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(href);
    };

    const handleNavigation = () => {
        setSidebarOpen(false);
    };

    const handleLogout = async () => {
        await logout();

        setSidebarOpen(false);

        router.push("/");
        router.refresh();
    };

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname, setSidebarOpen]);

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    return (
        <>
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close admin sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >

                <div className="flex h-14 shrink-0 items-center justify-end border-b border-gray-100 px-3 md:hidden">

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                    >
                        <HiOutlineXMark className="h-6 w-6" />
                    </button>

                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                                    onClick={handleNavigation}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                        active
                                            ? "bg-gray-900 text-white"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                    </div>

                    <div className="my-5 border-t border-gray-100" />

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Store
                    </p>

                    <div className="space-y-1">

                        <Link
                            href="/"
                            onClick={handleNavigation}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                            <HiOutlineBuildingStorefront className="h-5 w-5 shrink-0" />

                            <span>View Store</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                        >
                            <HiOutlineArrowRightOnRectangle className="h-5 w-5 shrink-0" />

                            <span>Logout</span>
                        </button>

                    </div>

                </nav>


                <div className="shrink-0 border-t border-gray-100 p-4">

                    <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-400">
                            Admin Panel
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                            ShopEase Management
                        </p>
                    </div>

                </div>

            </aside>
        </>
    );
}