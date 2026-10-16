import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async headers() {
        return [{
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
