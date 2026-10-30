import CatalogPage from "@/components/product/CatalogPage";
import { resolveCatalogPage, catalogMetadata, type CatalogSearchParams } from "@/lib/catalog-page";

type CategoryPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> };

async function getPageData({ params, searchParams }: CategoryPageProps) {
    return resolveCatalogPage((await params).slug, await searchParams);
}

export async function generateMetadata(props: CategoryPageProps) {
    return catalogMetadata(await getPageData(props));
}

export default async function CategoryPage(props: CategoryPageProps) {
    return <CatalogPage data={await getPageData(props)} />;
}
