import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import AddToWishlistButton from "@/components/wishlist/AddToWishlistButton";

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

type ProductResponse = {
    success: boolean;
    data: {
        product: Product;
    };
};

async function getProduct(id: string): Promise<Product | null> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products/${id}`,
        {
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch product");
    }

    const result: ProductResponse = await response.json();

    return result.data.product;
}

type ProductDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
    const { id } = await params;

    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <section className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-10">
                <Link
                    href="/products"
                    className="text-sm text-gray-500 transition hover:text-black"
                >
                    ← Back to Products
                </Link>

                <div className="mt-8 grid gap-10 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500">
                            {product.category.name}
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                            {product.name}
                        </h1>

                        <p className="mt-5 text-2xl font-bold text-gray-900">
                            Rs. {product.price.toLocaleString()}
                        </p>

                        <div className="mt-6 border-t border-gray-200 pt-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Description
                            </h2>

                            <p className="mt-3 leading-7 text-gray-600">
                                {product.description}
                            </p>
                        </div>

                        <div className="mt-6">
                            {product.stock > 0 ? (
                                <p className="text-sm font-medium text-green-600">
                                    {product.stock} items available
                                </p>
                            ) : (
                                <p className="text-sm font-medium text-red-500">
                                    Out of stock
                                </p>
                            )}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <AddToCartButton
                                productId={product._id}
                                stock={product.stock}
                            />
                            <AddToWishlistButton
                                productId={product._id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}