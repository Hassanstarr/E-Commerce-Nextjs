import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Orders",
    description: "Manage your my orders at ShopEase.",
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
