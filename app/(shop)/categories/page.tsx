import Link from "next/link";

type Category = {
    _id: string;
    name: string;
    description?: string;
    image?: string;
};

type CategoriesResponse = {
    success: boolean;
    data: {
        categories: Category[];
    };
};

async function getCategories(): Promise<Category[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    const result: CategoriesResponse = await response.json();

    return result.data.categories;
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <section className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-10">
                    <p className="text-sm font-medium text-gray-500">
                        Browse
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                        Categories
                    </h1>

                    <p className="mt-3 max-w-2xl text-gray-500">
                        Explore our products by category.
                    </p>
                </div>

                {categories.length === 0 ? (
                    <div className="flex min-h-75 items-center justify-center rounded-xl border border-gray-200 bg-white">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                No categories available
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Categories will appear here once they are added.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                href={`/products?category=${category._id}`}
                                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex h-40 items-center justify-center bg-gray-100">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-300">
                                            {category.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="p-5">
                                    <h2 className="text-lg font-semibold text-gray-900 transition group-hover:text-gray-600">
                                        {category.name}
                                    </h2>

                                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                        {category.description ||
                                            "Explore products in this category."}
                                    </p>

                                    <p className="mt-4 text-sm font-medium text-black">
                                        View Products →
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}