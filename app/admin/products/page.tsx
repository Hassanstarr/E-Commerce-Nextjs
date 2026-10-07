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

    const lowStockCount = products.filter(
        (product) => product.stock > 0 && product.stock <= 5
    ).length;

    const outOfStockCount = products.filter(
        (product) => product.stock === 0
    ).length;

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-medium text-gray-500">
                            Store Management
                        </p>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Products
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage your store inventory and products.
                        </p>
                    </div>

                    <Link
                        href="/admin/products/add"
                        className="inline-flex w-fit items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Add Product
                    </Link>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Products
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                            {products.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Low Stock
                        </p>

                        <p className="mt-2 text-2xl font-bold text-amber-600">
                            {lowStockCount}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            5 or fewer items
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Out of Stock
                        </p>

                        <p className="mt-2 text-2xl font-bold text-red-600">
                            {outOfStockCount}
                        </p>
                    </div>
                </div>

                <ProductTable products={products} />
            </main>
        </section>
    );
}