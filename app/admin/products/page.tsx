import ProductsView, { Product } from "@/components/admin/ProductsView";

async function getProducts(): Promise<Product[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`,
        {
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch products"
        );
    }

    return result.data.products;
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return <ProductsView products={products} />;
}