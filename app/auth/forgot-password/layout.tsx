import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password", description: "Reset your ShopEase account password securely.", robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
