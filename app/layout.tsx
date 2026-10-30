import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { indexingAllowed, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl()),
    title: { default: "ShopEase | Shop Products Online", template: "%s | ShopEase" },
    description: "Browse products and categories at ShopEase, compare current prices and offers, and shop online.",
    robots: { index: indexingAllowed(), follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <body className="min-h-dvh bg-white text-gray-900 antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
