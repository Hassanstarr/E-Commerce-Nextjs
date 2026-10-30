import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create an Account", description: "Create and verify your ShopEase account.", robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
