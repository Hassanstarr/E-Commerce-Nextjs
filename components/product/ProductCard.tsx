import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
    product: {
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
};

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
            <Link href={`/products/${product._id}`}>
                <div className="relative h-56 w-full bg-gray-100">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </Link>

            <div className="p-5">
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

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">
                        Rs. {product.price.toLocaleString()}
                    </p>

                    <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                </div>
            </div>
        </div>
    );
}