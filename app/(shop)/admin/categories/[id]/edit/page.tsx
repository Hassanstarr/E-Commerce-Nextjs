import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";

type Category = {
    _id: string;
    name: string;
    description?: string;
    image?: string;
};

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

async function getCategory( id: string ): Promise<Category | null> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories/${id}`,
        {
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        return null;
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch category"
        );
    }

    return result.data.category;
}

export default async function EditCategoryPage({ params }: PageProps) {
    const { id } = await params;

    const category = await getCategory(id);

    if (!category) {
        notFound();
    }

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <main className="mx-auto w-full max-w-5xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Category
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Update category information.
                    </p>
                </div>

                <CategoryForm
                    initialData={{
                        _id: category._id,
                        name: category.name,
                        description: category.description || "",
                        image: category.image || "",
                    }}
                />
            </main>
        </section>
    );
}