import Link from "next/link";
import Image from "next/image";
import ProductPrice from "@/components/product/ProductPrice";
import AddToCartButton from "@/components/cart/AddToCartButton";

type ProductCardProps = {
    eager?: boolean;
    product: {
        _id: string;
        name: string;
        description: string;
        price: number;
        discountPercent?: number;
        discountAudience?: "all" | "members";
        memberDiscountPercent?: number;
        memberDiscountEndsAt?: string | null;
        discountEndsAt?: string | null;
        image: string;
        stock: number;
        category: {
            _id: string;
            name: string;
        };
    };
};

export default function ProductCard({ product, eager = false }: ProductCardProps) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-xl">
            <Link href={`/products/${product._id}`}>
                <div className="relative h-56 w-full bg-gray-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        loading={eager ? "eager" : "lazy"}
                        sizes="(min-width: 1280px) 294px, (min-width: 1024px) calc((100vw - 80px) / 3), (min-width: 640px) calc((100vw - 56px) / 2), calc(100vw - 32px)"
                        className="object-cover"
                    />
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <p className="text-sm text-gray-500">
                    {product.category.name}
                </p>

                <Link href={`/products/${product._id}`}>
                    <h2 className="mt-1 line-clamp-1 text-lg font-semibold text-gray-900 hover:text-gray-600">
                        {product.name}
                    </h2>
                </Link>

                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                </p>

                <div className="mt-auto flex items-start justify-between gap-3 pt-4">
                    <p className="min-w-0 flex-1 text-lg font-bold text-gray-900">
                        <ProductPrice product={product} />
                    </p>

                    <span className={`shrink-0 whitespace-nowrap pt-0.5 text-xs ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                </div>
                <div className="mt-3">
                    <AddToCartButton productId={product._id} productName={product.name} stock={product.stock} variant="card" />
                </div>
            </div>
        </div>
    );
}
