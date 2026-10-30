import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Checkout",
    description: "Manage your checkout at ShopEase.",
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
