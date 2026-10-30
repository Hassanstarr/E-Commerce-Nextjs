import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Support Chat",
    description: "Manage your support chat at ShopEase.",
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
