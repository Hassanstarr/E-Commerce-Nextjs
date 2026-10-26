import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductEditModal from "@/components/admin/ProductEditModal";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

async function getProduct(id: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products/${id}`,
            { cache: "no-store" }
        );
        if (response.ok) {
            const result = await response.json();
            return result.data.product;
        }
    } catch {
        // Fall back to direct database query
    }

    await connectDB();
    const product = await Product.findById(id).lean();
    return product;
}

async function getCategories() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`,
            { cache: "no-store" }
        );
        if (response.ok) {
            const result = await response.json();
            return result.data.categories;
        }
    } catch {
        // Fall back to direct database query
    }

    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return categories.map((cat: any) => ({
        _id: cat._id.toString(),
        name: cat.name,
    }));
}

export default async function InterceptedEditProductPage({ params }: PageProps) {
    const { id } = await params;

    const [product, categories] = await Promise.all([
        getProduct(id),
        getCategories(),
    ]);

    if (!product) {
        notFound();
    }

    const categoryId =
        typeof product.category === "string"
            ? product.category
            : product.category?._id?.toString() || product.category?.toString() || "";

    return (
        <ProductEditModal
            categories={categories}
            product={{
                _id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                category: categoryId,
                stock: product.stock,
                discountPercent: product.discountPercent || 0,
                discountAudience: product.discountAudience || "all",
                memberDiscountPercent: product.memberDiscountPercent || 0,
                memberDiscountEndsAt: product.memberDiscountEndsAt ? new Date(product.memberDiscountEndsAt).toISOString() : null,
                discountEndsAt: product.discountEndsAt ? new Date(product.discountEndsAt).toISOString() : null,
            }}
        />
    );
}
