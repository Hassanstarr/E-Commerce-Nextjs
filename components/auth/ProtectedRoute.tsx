"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type ProtectedRouteProps = {
children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { user, loading } = useAuth();
    
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/auth/login");
        }
    }, [loading, user, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex-1 bg-white" />
        );
    }

    return <>{children}</>;
}