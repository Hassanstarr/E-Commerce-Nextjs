import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { categoryPath, productPath } from "@/lib/catalog-url";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await connectDB();
    const [products, categories] = await Promise.all([
        Product.find().select("name slug updatedAt").lean(),
        Category.find().select("name slug updatedAt").lean(),
    ]);
    const base = siteUrl();
    return [
        ...["/", "/products", "/categories", "/contact"].map((path) => ({ url: new URL(path, base).toString() })),
        ...categories.map((category) => ({ url: new URL(categoryPath({ ...category, _id: String(category._id) }), base).toString(), lastModified: category.updatedAt })),
        ...products.map((product) => ({ url: new URL(productPath({ ...product, _id: String(product._id) }), base).toString(), lastModified: product.updatedAt })),
    ];
}
