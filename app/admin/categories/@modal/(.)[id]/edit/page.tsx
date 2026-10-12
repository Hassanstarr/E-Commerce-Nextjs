import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import CategoryEditModal from "@/components/admin/CategoryEditModal";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

async function getCategory(id: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories/${id}`,
            { cache: "no-store" }
        );
        if (response.ok) {
            const result = await response.json();
            return result.data.category;
        }
    } catch {
        // Fall back to direct database query
    }

    await connectDB();
    const category = await Category.findById(id).lean();
    return category;
}

export default async function InterceptedEditCategoryPage({ params }: PageProps) {
    const { id } = await params;
    const category = await getCategory(id);

    if (!category) {
        notFound();
    }

    return (
        <CategoryEditModal
            category={{
                _id: category._id.toString(),
                name: category.name,
                description: category.description || "",
                image: category.image || "",
            }}
        />
    );
}
