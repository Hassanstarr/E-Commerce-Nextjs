import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getCatalogQuery } from "@/lib/catalog";
import { categoryPath } from "@/lib/catalog-url";
import { catalogPagePath, pageMetadata, seoDescription } from "@/lib/seo";
import { getPublicCategories, getPublicCategory, getPublicProductsPage } from "@/services/public-catalog.service";

export type CatalogSearchParams = { category?: string | string[]; q?: string | string[]; page?: string | string[] };

export async function resolveCatalogPage(identifier: string, params: CatalogSearchParams, legacy = false) {
    const category = identifier ? await getPublicCategory(identifier) : null;
    if (identifier && !category) notFound();
    const search = getCatalogQuery(params.q);
    const pageValue = getCatalogQuery(params.page);
    const [categories, pagination] = await Promise.all([
        getPublicCategories(), getPublicProductsPage(category?._id || "", search, pageValue),
    ]);
    const pathname = category ? categoryPath(category) : "/products";
    const canonical = catalogPagePath(pathname, pagination.page, search);
    if (legacy || (category && `/categories/${identifier}` !== pathname)) permanentRedirect(canonical);
    if (pageValue && (pageValue !== String(pagination.page) || pagination.page === 1)) redirect(canonical);
    return { category, categories, pagination, pathname, canonical, search };
}

export type CatalogPageData = Awaited<ReturnType<typeof resolveCatalogPage>>;

export function catalogMetadata(data: CatalogPageData) {
    const title = `${data.category?.name || "All Products"}${data.pagination.page > 1 ? ` – Page ${data.pagination.page}` : ""}`;
    return pageMetadata(title, seoDescription(data.category?.description ||
        (data.category ? `Browse ${data.category.name} at ShopEase. Compare products, current prices and available offers.` : "Browse all ShopEase products, compare prices and discover current offers across our categories.")),
    data.canonical, data.category?.image, Boolean(data.search));
}
