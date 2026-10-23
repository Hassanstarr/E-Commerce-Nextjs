"use client";

import { createContext, useContext } from "react";
import useChatConnection from "@/hooks/useChatConnection";

const AdminChatContext = createContext<ReturnType<typeof useChatConnection> | null>(null);

export default function AdminChatProvider({ children }: { children: React.ReactNode }) {
    const connection = useChatConnection();

    return <AdminChatContext.Provider value={connection}>{children}</AdminChatContext.Provider>;
}

export function useAdminChatConnection() {
    const connection = useContext(AdminChatContext);
    if (!connection) throw new Error("Admin chat connection is unavailable");
    return connection;
}
