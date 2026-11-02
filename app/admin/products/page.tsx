import { getAdminCatalogProducts } from "@/services/admin-catalog.service";
import ProductsView, { Product } from "@/components/admin/ProductsView";

async function getProducts(): Promise<Product[]> {
    return getAdminCatalogProducts();
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return <ProductsView products={products} />;
}