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
        if (!loading && !user) {
            router.replace("/auth/login");
            return;
        }

        if (!loading && user && user.role !== "admin") {
            router.replace("/");
        }
    }, [loading, user, router]);

    if (
        loading ||
        !user ||
        user.role !== "admin"
    ) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return <>{children}</>;
}