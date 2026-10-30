import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Wishlist",
    description: "Manage your wishlist at ShopEase.",
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
