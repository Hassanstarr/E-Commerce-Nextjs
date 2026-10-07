"use client";

import { HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";

interface AdminHeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({ sidebarOpen, setSidebarOpen }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-40 h-16 border-b border-gray-200 bg-white">
            <nav className="flex h-full items-center justify-between px-4 sm:px-6">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={
                            sidebarOpen
                                ? "Close admin sidebar"
                                : "Open admin sidebar"
                        }
                        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 md:hidden"
                    >
                        {sidebarOpen ? (
                            <HiOutlineXMark className="h-6 w-6" />
                        ) : (
                            <HiOutlineBars3 className="h-6 w-6" />
                        )}
                    </button>

                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            ShopEase
                        </h1>

                        <p className="hidden text-xs text-gray-500 sm:block">
                            Admin Dashboard
                        </p>
                    </div>

                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-gray-600">
                        Admin
                    </span>
                </div>

            </nav>
        </header>
    );
}