import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
    title: "ShopEase",
    description: "A modern ecommerce application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-white text-gray-900 antialiased">
                <Navbar />

                <main>
                    {children}
                </main>

                <Footer />
            </body>
        </html>
    );
}