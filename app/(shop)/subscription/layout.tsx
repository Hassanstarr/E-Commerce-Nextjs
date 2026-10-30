import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Email Subscriptions",
    description: "Manage your email subscriptions at ShopEase.",
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
