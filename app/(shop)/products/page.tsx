import CatalogPage from "@/components/product/CatalogPage";
import { getCatalogQuery } from "@/lib/catalog";
import { resolveCatalogPage, catalogMetadata, type CatalogSearchParams } from "@/lib/catalog-page";

type ProductsPageProps = { searchParams: Promise<CatalogSearchParams> };

async function getPageData(searchParams: Promise<CatalogSearchParams>) {
    const params = await searchParams;
    const category = getCatalogQuery(params.category);
    return resolveCatalogPage(category, params, Boolean(category));
}

export async function generateMetadata({ searchParams }: ProductsPageProps) {
    return catalogMetadata(await getPageData(searchParams));
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    return <CatalogPage data={await getPageData(searchParams)} />;
}
