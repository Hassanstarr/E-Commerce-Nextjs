import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        const privatePages = ["/admin/:path*", "/auth/:path*", "/api/:path*", "/api-docs/:path*", "/account/:path*", "/settings/:path*", "/cart/:path*", "/wishlist/:path*", "/orders/:path*", "/order-success/:path*", "/checkout/:path*", "/chat/:path*", "/subscription/:path*", "/membership/:path*"];
        return [{ source: "/:path*", headers: [
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            ...(process.env.VERCEL_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
        ] }, ...privatePages.map((source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] })), {
            source: "/auth/:path*",
            headers: [{
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin-allow-popups",
            }],
        }];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "example.com",
            },
        ],
    },
};

export default nextConfig;
