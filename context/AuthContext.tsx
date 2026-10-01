"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type User = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode; }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const response = await fetch("/api/auth/me", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            if (!response.ok) {
                setUser(null);
                return;
            }

            const result = await response.json();

            setUser(result.data.user);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            await refreshUser();
            setLoading(false);
        };

        loadUser();
    }, []);

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}