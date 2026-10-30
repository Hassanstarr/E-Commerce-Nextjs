import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Order Confirmation",
    description: "Manage your order confirmation at ShopEase.",
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
