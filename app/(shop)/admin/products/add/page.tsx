import ProductForm from "@/components/admin/ProductForm";

type Category = {
    _id: string;
    name: string;
};

async function getCategories(): Promise<Category[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`,
        {
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch categories"
        );
    }

    return result.data.categories;
}

export default async function AddProductPage() {
    const categories = await getCategories();

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <main className="mx-auto w-full max-w-5xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Add Product
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Add a new product to your store.
                    </p>
                </div>

                <ProductForm categories={categories} />
            </main>
        </section>
    );
}