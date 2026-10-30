import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getPublicCategories } from "@/services/public-catalog.service";
import { categoryPath } from "@/lib/catalog-url";
import { pageMetadata } from "@/lib/seo";
import ProductCard from "@/components/product/ProductCard";

export const metadata = pageMetadata("Shop Products Online", "Explore ShopEase products and categories, compare current prices and discover offers for your next order.", "/");

export default async function HomePage() {
    const [products, categories] = await Promise.all([
        getFeaturedProducts(),
        getPublicCategories(),
    ]);

    const featuredProducts = products.slice(0, 4);
    const featuredCategories = categories.slice(0, 4);

    return (
        <div className="bg-white">
            <section className="border-b border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Welcome to ShopEase
                        </p>

                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                            Find products you&apos;ll love.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                            Explore our collection of quality products,
                            discover new categories, and enjoy a simple
                            shopping experience.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                href="/products"
                                className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Shop Products
                            </Link>

                            <Link
                                href="/categories"
                                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
                            >
                                View Categories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Featured Products
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Take a look at some of our latest products.
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="hidden text-sm font-medium text-gray-900 hover:underline sm:block"
                    >
                        View All
                    </Link>
                </div>

                {featuredProducts.length > 0 ? (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    eager
                                    headingLevel={3}
                                />
                            ))}
                        </div>

                        <div className="mt-8 text-center sm:hidden">
                            <Link
                                href="/products"
                                className="text-sm font-medium text-gray-900 hover:underline"
                            >
                                View All Products
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            No products available
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                            Products will appear here once they are added
                            to the store.
                        </p>
                    </div>
                )}
            </section>

            <section className="border-y border-gray-200 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            Shop by Category
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Browse products by category.
                        </p>
                    </div>

                    {featuredCategories.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredCategories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={categoryPath(category)}
                                    className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                >
                                    {category.image && (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            unoptimized={!category.image.startsWith("https://res.cloudinary.com/")}
                                            width={320}
                                            height={160}
                                            sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw"
                                            className="mb-5 h-40 w-full rounded-lg object-cover"
                                        />
                                    )}

                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:underline">
                                        {category.name}
                                    </h3>

                                    {category.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                            {category.description}
                                        </p>
                                    )}

                                    <p className="mt-4 text-sm font-medium text-gray-900">
                                        Browse Products →
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                No categories available
                            </h3>

                            <p className="mt-2 text-sm text-gray-600">
                                Categories will appear here once they are
                                added.
                            </p>
                        </div>
                    )}

                    {categories.length > 4 && (
                        <div className="mt-8 text-center">
                            <Link
                                href="/categories"
                                className="text-sm font-medium text-gray-900 hover:underline"
                            >
                                View All Categories
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Why Shop With Us?
                    </h2>

                    <p className="mx-auto mt-2 max-w-2xl text-gray-600">
                        We keep shopping simple, convenient, and reliable.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3 bg-white">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-900">
                            ✓
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-gray-900">
                            Quality Products
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Browse a carefully managed collection of
                            products.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-900">
                            ♡
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-gray-900">
                            Wishlist
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Save products you like and come back to them
                            later.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-900">
                            +
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-gray-900">
                            Simple Shopping
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Add products to your cart and manage your
                            shopping easily.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-black">
                <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        Ready to start shopping?
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-gray-300">
                        Explore our products and find something that
                        fits what you&apos;re looking for.
                    </p>

                    <Link
                        href="/products"
                        className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
                    >
                        Start Shopping
                    </Link>
                </div>
            </section>
        </div>
    );
}
