import { cache } from "react";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { catalogId } from "@/lib/catalog-url";
import type { ProductDiscount } from "@/lib/product-pricing";

export type PublicCategory = {
    _id: string; slug?: string; name: string; description?: string; image?: string; updatedAt: string;
};
export type PublicProduct = Omit<ProductDiscount, "discountEndsAt" | "memberDiscountEndsAt"> & {
    discountEndsAt?: string | null; memberDiscountEndsAt?: string | null;
    _id: string; slug?: string; name: string; description: string; image: string; price: number; stock: number;
    category: PublicCategory; updatedAt: string;
};

const productFields = "name slug description image price stock category discountPercent discountEndsAt discountAudience memberDiscountPercent memberDiscountEndsAt updatedAt";
const categoryFields = "name slug description image updatedAt";
const serialize = <T>(value: unknown): T => JSON.parse(JSON.stringify(value));

export const getPublicCategories = cache(async (): Promise<PublicCategory[]> => {
    await connection();
    await connectDB();
    return serialize(await Category.find().select(categoryFields).sort({ createdAt: -1 }).lean());
});

export const getPublicCategory = cache(async (identifier: string): Promise<PublicCategory | null> => {
    await connection();
    const id = catalogId(identifier);
    if (!id) return null;
    await connectDB();
    return serialize(await Category.findById(id).select(categoryFields).lean());
});

export const getPublicProduct = cache(async (identifier: string): Promise<PublicProduct | null> => {
    await connection();
    const id = catalogId(identifier);
    if (!id) return null;
    await connectDB();
    const product = await Product.findById(id).select(productFields).populate("category", categoryFields).lean();
    if (!product || !product.category) return null;
    return serialize(product);
});

export const getPublicProductsPage = cache(async (category = "", search = "", pageValue = "1") => {
    await connection();
    await connectDB();
    const filter: { category?: string; $or?: { name?: RegExp; description?: RegExp }[] } = {};
    if (category) filter.category = category;
    if (search) {
        const query = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ name: query }, { description: query }];
    }
    const total = await Product.countDocuments(filter);
    const limit = 12;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const requestedPage = /^\d+$/.test(pageValue) ? Number(pageValue) : 1;
    const page = Number.isSafeInteger(requestedPage) ? Math.min(totalPages, Math.max(1, requestedPage)) : 1;
    const products = await Product.find(filter).select(productFields).populate("category", categoryFields)
        .sort({ name: 1, _id: 1 }).collation({ locale: "en", strength: 2 }).skip((page - 1) * limit).limit(limit).lean();
    return { items: serialize<PublicProduct[]>(products).filter((product) => product.category), total, totalPages, page,
        from: total === 0 ? 0 : (page - 1) * limit + 1, to: Math.min(page * limit, total) };
});

export const getFeaturedProducts = cache(async (): Promise<PublicProduct[]> => {
    await connection();
    await connectDB();
    const products = await Product.find().select(productFields).populate("category", categoryFields).sort({ createdAt: -1 }).limit(4).lean();
    return serialize<PublicProduct[]>(products).filter((product) => product.category);
});
