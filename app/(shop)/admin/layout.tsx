import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children, }: { children: React.ReactNode; }) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">

            <AdminSidebar />

            <main className="min-w-0 flex-1">
                {children}
            </main>

        </div>
    );
}