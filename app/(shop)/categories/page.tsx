import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getPublicCategories } from "@/services/public-catalog.service";
import { categoryPath } from "@/lib/catalog-url";
import { catalogPagePath, pageMetadata } from "@/lib/seo";
import CatalogPagination from "@/components/ui/CatalogPagination";
import { getCatalogQuery, paginateCatalog } from "@/lib/catalog";

type CategoriesPageProps = {
    searchParams: Promise<{
        q?: string | string[];
        page?: string | string[];
    }>;
};

export async function generateMetadata({ searchParams }: CategoriesPageProps) {
    const params = await searchParams;
    const search = getCatalogQuery(params.q);
    const categories = await getPublicCategories();
    const query = search.toLowerCase();
    const filtered = categories.filter((category) => !query || category.name.toLowerCase().includes(query) || category.description?.toLowerCase().includes(query));
    const pagination = paginateCatalog(filtered, getCatalogQuery(params.page));
    return pageMetadata(`Categories${pagination.page > 1 ? ` – Page ${pagination.page}` : ""}`, "Explore ShopEase categories and discover products, prices and offers in each collection.", catalogPagePath("/categories", pagination.page, search), undefined, Boolean(search));
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
    const params = await searchParams;
    const search = getCatalogQuery(params.q);
    const categories = await getPublicCategories();
    const query = search.toLowerCase();
    const filteredCategories = categories.filter((category) =>
        !query || category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
    );
    const pageValue = getCatalogQuery(params.page);
    const pagination = paginateCatalog(filteredCategories, pageValue);
    if (pageValue && (pageValue !== String(pagination.page) || pagination.page === 1)) {
        redirect(catalogPagePath("/categories", pagination.page, search));
    }

    return (
        <section className="flex flex-1 bg-gray-50 items-center justify-center">
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

                <form action="/categories" className="mb-8 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                        <label htmlFor="category-search" className="text-sm font-medium text-gray-700">
                            Search Categories
                        </label>
                        <input
                            id="category-search"
                            name="q"
                            type="search"
                            defaultValue={search}
                            key={search}
                            placeholder="Search by name or description"
                            className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>
                    <button type="submit" className="cursor-pointer rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800">
                        Search
                    </button>
                    {search && (
                        <Link href="/categories" className="self-start text-sm font-medium text-gray-600 transition hover:text-black sm:self-end">
                            Clear Search
                        </Link>
                    )}
                </form>

                {pagination.total > 0 && (
                    <p className="mb-5 text-sm text-gray-500">
                        Showing {pagination.from}–{pagination.to} of {pagination.total} {pagination.total === 1 ? "category" : "categories"}
                    </p>
                )}

                {pagination.total === 0 ? (
                    <div className="flex py-12 items-center justify-center rounded-xl border border-gray-200 bg-white">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {search ? "No categories match your search" : "No categories available"}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                {search ? "Try another search or clear your search above." : "Categories will appear here once they are added."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {pagination.items.map((category) => (
                            <Link
                                key={category._id}
                                href={categoryPath(category)}
                                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex h-40 items-center justify-center bg-gray-100">
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            unoptimized={!category.image.startsWith("https://res.cloudinary.com/")}
                                            width={320}
                                            height={160}
                                            sizes="(min-width: 1280px) 294px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
                <CatalogPagination
                    pathname="/categories"
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    filters={{ q: search }}
                />
            </div>
        </section>
    );
}
