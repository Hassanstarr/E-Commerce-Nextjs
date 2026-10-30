import type { Metadata } from "next";
import { getProductPricing, type ProductDiscount } from "@/lib/product-pricing";
import { productPath } from "@/lib/catalog-url";

export function siteUrl() {
    const configured = process.env.NEXT_PUBLIC_APP_URL;
    if (!configured && process.env.NODE_ENV === "production") {
        throw new Error("Set NEXT_PUBLIC_APP_URL to the public HTTPS store URL for SEO.");
    }
    const url = new URL(configured || "http://localhost:3000");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (!["http:", "https:"].includes(url.protocol) || (process.env.NODE_ENV === "production" && url.protocol !== "https:" && !local)
        || (process.env.VERCEL_ENV === "production" && local)) {
        throw new Error("NEXT_PUBLIC_APP_URL must be a valid store URL (HTTPS in production).");
    }
    return url.origin;
}

export function indexingAllowed() {
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(siteUrl()).hostname);
    return !local && process.env.NODE_ENV === "production" && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production");
}

export function pageMetadata(title: string, description: string, path: string, image?: string, noindex = false): Metadata {
    const url = new URL(path, siteUrl()).toString();
    return {
        title, description,
        alternates: { canonical: url },
        robots: { index: indexingAllowed() && !noindex, follow: true },
        openGraph: { type: "website", siteName: "ShopEase", title: `${title} | ShopEase`, description, url,
            ...(image ? { images: [{ url: image, alt: title }] } : {}) },
        twitter: { card: image ? "summary_large_image" : "summary", title: `${title} | ShopEase`, description,
            ...(image ? { images: [image] } : {}) },
    };
}

export function catalogPagePath(path: string, page: number, search = "") {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (page > 1) query.set("page", String(page));
    return query.size ? `${path}?${query}` : path;
}

export function seoDescription(text: string) {
    const description = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
}

export function productStructuredData(product: ProductDiscount & {
    _id: string; slug?: string; name: string; description: string; image: string; price: number; stock: number;
}, now = Date.now()) {
    const pricing = getProductPricing(product, now, "user");
    const publicOffer = pricing.offers.find((offer) => offer.discountAudience === "all");
    return {
        "@context": "https://schema.org", "@type": "Product",
        name: product.name, description: product.description, image: [product.image], sku: product._id,
        url: new URL(productPath(product), siteUrl()).toString(),
        offers: { "@type": "Offer", url: new URL(productPath(product), siteUrl()).toString(),
            price: pricing.price.toFixed(2), priceCurrency: "PKR",
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            ...(publicOffer?.discountEndsAt ? { priceValidUntil: new Date(publicOffer.discountEndsAt).toISOString() } : {}) },
    };
}

export function serializeJsonLd(value: unknown) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}
