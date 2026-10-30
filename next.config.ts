import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async headers() {
        const privatePages = ["/admin/:path*", "/auth/:path*", "/api/:path*", "/api-docs/:path*", "/account/:path*", "/settings/:path*", "/cart/:path*", "/wishlist/:path*", "/orders/:path*", "/order-success/:path*", "/checkout/:path*", "/chat/:path*", "/subscription/:path*", "/membership/:path*"];
        return [...privatePages.map((source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] })), {
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
