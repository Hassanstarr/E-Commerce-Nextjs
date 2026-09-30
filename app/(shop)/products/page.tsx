import ProductGrid from "@/components/product/ProductGrid";

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

type ProductsResponse = {
    success: boolean;
    data: {
        products: Product[];
    };
};

async function getProducts(): Promise<Product[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    const result: ProductsResponse = await response.json();

    return result.data.products;
}

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <section className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-10">
                    <p className="text-sm font-medium text-gray-500">
                        Shop
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                        All Products
                    </h1>

                    <p className="mt-3 max-w-2xl text-gray-500">
                        Browse our collection of products and find something
                        that fits your needs.
                    </p>
                </div>

                <ProductGrid products={products} />
            </div>
        </section>
    );
}