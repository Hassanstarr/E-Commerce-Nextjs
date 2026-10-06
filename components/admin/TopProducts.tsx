const products = [
    {
        name: "iPhone 15",
        category: "Electronics",
        sold: 42,
        revenue: "Rs. 8,40,000",
    },
    {
        name: "AirPods Pro",
        category: "Accessories",
        sold: 35,
        revenue: "Rs. 5,25,000",
    },
    {
        name: "Nike Air Max",
        category: "Shoes",
        sold: 28,
        revenue: "Rs. 3,92,000",
    },
    {
        name: "MacBook Air",
        category: "Electronics",
        sold: 21,
        revenue: "Rs. 6,30,000",
    },
];

export default function TopProducts() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
                <h2 className="font-semibold text-gray-900">
                    Top Products
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Best performing products.
                </p>
            </div>

            <div className="mt-5 space-y-4">
                {products.map((product, index) => (
                    <div
                        key={product.name}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                            {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                {product.category}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {product.sold} sold
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                {product.revenue}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}