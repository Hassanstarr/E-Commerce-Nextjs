import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

type Category = {
    _id: string;
    name: string;
};

type Product = {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category:
        | string
        | {
              _id: string;
              name: string;
          };
    stock: number;
};

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

async function getProduct(
    id: string
): Promise<Product | null> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/products/${id}`,
        {
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        return null;
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch product"
        );
    }

    return result.data.product;
}

async function getCategories(): Promise<Category[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/categories`,
        {
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Failed to fetch categories"
        );
    }

    return result.data.categories;
}

export default async function EditProductPage({ params }: PageProps) {
    const { id } = await params;

    const [product, categories] = await Promise.all([
        getProduct(id),
        getCategories(),
    ]);

    if (!product) {
        notFound();
    }

    const categoryId =
        typeof product.category === "string"
            ? product.category
            : product.category._id;

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <main className="mx-auto w-full max-w-5xl px-4 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Product
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Update product information.
                    </p>
                </div>

                <ProductForm
                    categories={categories}
                    initialData={{
                        _id: product._id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        image: product.image,
                        category: categoryId,
                        stock: product.stock,
                    }}
                />
            </main>
        </section>
    );
}