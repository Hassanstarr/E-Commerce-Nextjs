import type { MetadataRoute } from "next";
import { indexingAllowed, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    if (!indexingAllowed()) return { rules: { userAgent: "*", disallow: "/" } };
    return {
        // Private HTML pages use noindex; allow crawlers to read that instruction.
        rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
        sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
    };
}
