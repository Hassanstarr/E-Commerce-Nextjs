import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import ProductAddModal from "@/components/admin/ProductAddModal";

async function getCategories(): Promise<{ _id: string; name: string }[]> {
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

export default async function InterceptedAddProductPage() {
    const categories = await getCategories();

    return <ProductAddModal categories={categories} />;
}
