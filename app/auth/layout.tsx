"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { subscriptionLoginRedirect } from "@/lib/subscription";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace(subscriptionLoginRedirect(user.role === "admin" ? "/admin" : "/"));
        }
    }, [loading, user, router]);

    if (loading || user) {
        return (
            <div className="min-h-dvh flex-1 bg-white" />
        );
    }

    return <>{children}</>;
}
