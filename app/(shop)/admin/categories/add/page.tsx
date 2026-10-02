import CategoryForm from "@/components/admin/CategoryForm";

export default function AddCategoryPage() {
    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <main className="mx-auto w-full max-w-5xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Add Category
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Create a new product category.
                    </p>
                </div>

                <CategoryForm />
            </main>
        </section>
    );
}