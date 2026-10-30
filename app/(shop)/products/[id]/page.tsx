import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import AddToWishlistButton from "@/components/wishlist/AddToWishlistButton";
import ProductPrice from "@/components/product/ProductPrice";
import DiscountTimer from "@/components/product/DiscountTimer";
import { getPublicProduct } from "@/services/public-catalog.service";
import { productPath, categoryPath } from "@/lib/catalog-url";
import { pageMetadata, seoDescription, productStructuredData, serializeJsonLd } from "@/lib/seo";

async function getProduct(identifier: string) {
    const product = await getPublicProduct(identifier);
    if (!product) notFound();
    const path = productPath(product);
    if (`/products/${identifier}` !== path) permanentRedirect(path);
    return product;
}

type ProductDetailsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export async function generateMetadata({ params }: ProductDetailsPageProps) {
    const product = await getProduct((await params).id);
    return pageMetadata(product.name, seoDescription(product.description), productPath(product), product.image);
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
    const { id } = await params;

    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <section className="flex-1 bg-gray-50">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productStructuredData(product)) }} />
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
                            sizes="(min-width: 1280px) 564px, (min-width: 768px) calc((100vw - 152px) / 2), calc(100vw - 80px)"
                            loading="eager"
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col justify-center">
                        <p className="text-sm font-medium text-gray-500">
                            <Link href={categoryPath(product.category)} className="hover:text-black">{product.category.name}</Link>
                        </p>

                        <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                            {product.name}
                        </h1>

                        <p className="mt-5 text-2xl font-bold text-gray-900">
                            <ProductPrice product={product} variant="detail" />
                        </p>
                        <DiscountTimer product={product} />

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
