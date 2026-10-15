import ProductGrid from "@/components/product/ProductGrid";
import ProductFilter from "@/components/product/ProductFilter";
import CatalogPagination from "@/components/ui/CatalogPagination";
import { getCatalogQuery, paginateCatalog } from "@/lib/catalog";
import Link from "next/link";

type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    category: {
        _id: string;
        name: string;
    };
};

type Category = {
    _id: string;
    name: string;
};

type CategoriesResponse = {
    success: boolean;
    data: {
        categories: Category[];
    };
};

type ProductsPageProps = {
    searchParams: Promise<{
        category?: string | string[];
        q?: string | string[];
        page?: string | string[];
    }>;
};

async function getProducts(category?: string): Promise<Product[]> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`);

    if (category) {
        url.searchParams.set("category", category);
    }

    const response = await fetch(url.toString(), {
        cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to fetch products");
    }

    return result.data.products;
}

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

export default async function ProductsPage({searchParams}: ProductsPageProps) {
    const params = await searchParams;
    const category = getCatalogQuery(params.category);
    const search = getCatalogQuery(params.q);

    let products: Product[] = [];
    let errorMessage = "";

    try {
        
        products = (await getProducts(category)).toSorted((a, b) =>
            a.name.localeCompare(b.name)
        );

    } catch (error) {
        if (error instanceof Error) {
            errorMessage =
                error.message === "Invalid category ID"
                    ? "Invalid category"
                    : error.message;
        } else {
            errorMessage = "Unable to retrieve products";
        }
    }

    const categories = (await getCategories()).sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    const selectedCategory = categories.find(
        (item) => item._id === category
    );

    const query = search.toLowerCase();
    const filteredProducts = products.filter((product) =>
        !query || product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    const pagination = paginateCatalog(filteredProducts, getCatalogQuery(params.page));

    return (
        <section className="flex min-h-screen bg-gray-50 items-center justify-center">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-10">
                    <p className="text-sm font-medium text-gray-500">
                        Shop
                    </p>

                    <h1 className={`mt-2 text-3xl font-bold md:text-4xl ${
                        category && !selectedCategory ? "text-red-400" : "text-gray-900"
                    }`}>
                        {selectedCategory
                            ? selectedCategory.name
                            : category
                            ? "Category Not Found"
                            : "All Products"}
                    </h1>

                    <p className="mt-3 max-w-2xl text-gray-500">
                        Browse our collection of products and find something
                        that fits your needs.
                    </p>
                </div>

                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
                    <ProductFilter categories={categories} />
                </div>

                {errorMessage ? (
                    <div className="flex min-h-75 items-center justify-center rounded-xl border border-gray-200 bg-white">
                        <div className="px-6 text-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {errorMessage}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Please select a category from the filter above.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {pagination.total > 0 && (
                            <p className="mb-5 text-sm text-gray-500">
                                Showing {pagination.from}–{pagination.to} of {pagination.total}{" "}
                                {pagination.total === 1
                                    ? "product"
                                    : "products"}
                                {selectedCategory
                                    ? ` in ${selectedCategory.name}`
                                    : ""}
                            </p>
                        )}

                        <ProductGrid
                            products={pagination.items}
                            emptyTitle={
                                search
                                    ? "No products match your search"
                                    : selectedCategory
                                    ? `No products in ${selectedCategory.name}`
                                    : "No products found"
                            }
                            emptyMessage={
                                search
                                    ? "Try another search or clear the filters."
                                    : selectedCategory
                                    ? "There are currently no products in this category."
                                    : "There are currently no products available."
                            }
                        />
                        {(search || category) && pagination.total === 0 && (
                            <div className="text-center">
                                <Link href="/products" className="text-sm font-medium text-gray-700 underline hover:text-black">
                                    Clear Filters
                                </Link>
                            </div>
                        )}
                        <CatalogPagination
                            pathname="/products"
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            filters={{ category, q: search }}
                        />
                    </>
                )}
            </div>
        </section>
    );
}