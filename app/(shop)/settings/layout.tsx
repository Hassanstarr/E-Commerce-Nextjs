import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Settings",
    description: "Manage your account settings at ShopEase.",
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
