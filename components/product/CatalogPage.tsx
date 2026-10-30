import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilter from "@/components/product/ProductFilter";
import CatalogPagination from "@/components/ui/CatalogPagination";
import type { CatalogPageData } from "@/lib/catalog-page";

export default function CatalogPage({ data }: { data: CatalogPageData }) {
    const { category, categories, pagination, pathname, search } = data;
    return (
        <section className="flex flex-1 items-center justify-center bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-10">
                    <p className="text-sm font-medium text-gray-500">Shop</p>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">{category?.name || "All Products"}</h1>
                    <p className="mt-3 max-w-2xl text-gray-500">{category?.description || "Browse our collection of products and find something that fits your needs."}</p>
                </div>
                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
                    <ProductFilter categories={categories.toSorted((a, b) => a.name.localeCompare(b.name))} selectedCategoryId={category?._id} />
                </div>
                {pagination.total > 0 && (
                    <p className="mb-5 text-sm text-gray-500">
                        Showing {pagination.from}–{pagination.to} of {pagination.total} {pagination.total === 1 ? "product" : "products"}{category ? ` in ${category.name}` : ""}
                    </p>
                )}
                <ProductGrid products={pagination.items}
                    emptyTitle={search ? "No products match your search" : category ? `No products in ${category.name}` : "No products found"}
                    emptyMessage={search ? "Try another search or clear the filters." : category ? "There are currently no products in this category." : "There are currently no products available."} />
                {search && pagination.total === 0 && (
                    <div className="text-center"><Link href={pathname} className="text-sm font-medium text-gray-700 underline hover:text-black">Clear Search</Link></div>
                )}
                <CatalogPagination pathname={pathname} page={pagination.page} totalPages={pagination.totalPages} filters={{ q: search }} />
            </div>
        </section>
    );
}
