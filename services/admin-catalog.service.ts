import { cache } from "react";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/middleware/admin";
import type { Product as AdminProduct } from "@/components/admin/ProductsView";

// Admin tables retain their existing filters; never use a single public API page as the full inventory.
export const getAdminCatalogProducts = cache(async (): Promise<AdminProduct[]> => {
    await requireAdmin();
    await connectDB();
    const products = await Product.find().populate("category", "name image").sort({ createdAt: -1, _id: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
});
