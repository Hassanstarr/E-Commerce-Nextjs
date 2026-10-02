import Link from "next/link";
import ProductTable from "@/components/admin/ProductTable";

type Product = {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category?: {
        _id: string;
        name: string;
    };
};

async function getProducts(): Promise<Product[]> {
    const response = await fetch(
        `${ process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`,
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

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <main className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Products
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Manage products in your store.
                        </p>
                    </div>

                    <Link
                        href="/admin/products/add"
                        className="self-start rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Add Product
                    </Link>
                </div>

                <ProductTable products={products} />
            </main>
        </section>
    );
}