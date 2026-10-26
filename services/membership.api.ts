import { apiRequest } from "@/lib/api";
import type { MembershipData } from "@/types/membership";

export async function getMembership(checkoutId?: string) {
    return apiRequest<{ data: MembershipData }>(`/api/membership${checkoutId ? `?checkout=${encodeURIComponent(checkoutId)}` : ""}`, { cache: "no-store" });
}

export async function startMembership() {
    return apiRequest<{ data: { url: string } }>("/api/membership", { method: "POST", body: JSON.stringify({ action: "checkout" }) });
}

export async function cancelMembership() {
    return apiRequest("/api/membership", { method: "POST", body: JSON.stringify({ action: "cancel" }) });
}
