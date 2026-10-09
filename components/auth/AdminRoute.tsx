"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/Spinner";

type AdminRouteProps = {
    children: React.ReactNode;
};

export default function AdminRoute({ children }: AdminRouteProps) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/auth/login");
            return;
        }

        if (user.role !== "admin") {
            router.replace("/");
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                    <Spinner />
                    <p className="text-sm text-gray-500">
                        Checking admin access...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return null;
    }

    return <>{children}</>;
}