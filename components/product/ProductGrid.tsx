import ProductCard from "./ProductCard";

type ProductGridProps = {
    products: {
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
    }[];
    emptyTitle?: string;
    emptyMessage?: string;
};

export default function ProductGrid({ products, emptyTitle, emptyMessage }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex min-h-75 flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                    {emptyTitle}
                </h2>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                    {emptyMessage}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard
                    key={product._id}
                    product={product}
                />
            ))}
        </div>
    );
}