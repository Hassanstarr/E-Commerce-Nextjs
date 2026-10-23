"use client";

import { useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminRoute from "@/components/auth/AdminRoute";
import AdminChatProvider from "@/components/admin/AdminChatProvider";

export default function AdminLayout({ children }: { children: React.ReactNode; }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AdminRoute>
            <AdminChatProvider>
                <div className="min-h-screen bg-gray-50">

                    <AdminHeader
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />

                    <AdminSidebar
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />

                    <main className="min-w-0 md:ml-64">
                        {children}
                    </main>

                </div>
            </AdminChatProvider>
        </AdminRoute>
    );
}
