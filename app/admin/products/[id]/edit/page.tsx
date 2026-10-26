import { notFound } from "next/navigation";
import ProductsView, { Product } from "@/components/admin/ProductsView";
import ProductEditModal from "@/components/admin/ProductEditModal";

type Category = {
    _id: string;
    name: string;
};

type ProductDetail = {
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

async function getProduct(id: string): Promise<ProductDetail | null> {
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

export default async function EditProductPage({ params }: PageProps) {
    const { id } = await params;

    const [product, categories, products] = await Promise.all([
        getProduct(id),
        getCategories(),
        getProducts(),
    ]);

    if (!product) {
        notFound();
    }

    const categoryId =
        typeof product.category === "string"
            ? product.category
            : product.category._id;

    return (
        <>
            <ProductsView products={products} />
            <ProductEditModal
                categories={categories}
                product={{
                    _id: product._id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    category: categoryId,
                    stock: product.stock,
                    discountPercent: product.discountPercent || 0,
                    discountAudience: product.discountAudience || "all",
                    memberDiscountPercent: product.memberDiscountPercent || 0,
                    memberDiscountEndsAt: product.memberDiscountEndsAt ? new Date(product.memberDiscountEndsAt).toISOString() : null,
                    discountEndsAt: product.discountEndsAt || null,
                }}
            />
        </>
    );
}
