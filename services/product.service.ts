import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Cart from "@/models/Cart";
import AppError from "@/lib/AppError";
import type { ProductInput } from "@/lib/validations";
import { saveProductWithDiscount } from "@/services/discount.service";

export async function createProduct(data: ProductInput, user?: string) {
    if (!mongoose.Types.ObjectId.isValid(data.category)) {
        throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findById(data.category);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const existingProduct = await Product.findOne({
        name: {
            $regex: `^${data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
        },
        category: data.category,
    });

    if (existingProduct) {
        throw new AppError(
            "A product with this name already exists in this category",
            409
        );
    }

    return await saveProductWithDiscount(data, undefined, user);
}

export async function getProducts(categoryId?: string, { page = 1, limit = 20, search = "" } = {}) {
    if (!Number.isSafeInteger(page) || page < 1 || page > 100000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
        throw new AppError("Use a valid page and a limit between 1 and 100", 400);
    }
    if (search.length > 100) throw new AppError("Search must be at most 100 characters", 400);
    const filter: mongoose.QueryFilter<InstanceType<typeof Product>> = {};
    if (search.trim()) {
        const literal = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [{ name: { $regex: literal, $options: "i" } }, { description: { $regex: literal, $options: "i" } }];
    }

    if (categoryId) {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new AppError("Invalid category ID", 400);
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        filter.category = categoryId;
    }

    const total = await Product.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    page = Math.min(page, totalPages);
    const products = await Product.find(filter).populate("category", "name image")
        .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean();
    return { products, pagination: { page, limit, total, totalPages } };
}

export async function getProductById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findById(id).populate(
        "category",
        "name image"
    ).lean();

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    const now = Date.now();
    return { ...product,
        ...(product.discountEndsAt && product.discountEndsAt.getTime() <= now ? { discountPercent: 0, discountEndsAt: null } : {}),
        ...(product.memberDiscountEndsAt && product.memberDiscountEndsAt.getTime() <= now ? { memberDiscountPercent: 0, memberDiscountEndsAt: null } : {}),
    };
}

export async function updateProduct( id: string, data: ProductInput, user?: string ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid product ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(data.category)) {
        throw new AppError("Invalid category ID", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    const category = await Category.findById(data.category);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const existingProduct = await Product.findOne({
        _id: { $ne: id },
        name: {
            $regex: `^${data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i",
        },
        category: data.category,
    });

    if (existingProduct) {
        throw new AppError(
            "A product with this name already exists in this category",
            409
        );
    }

    return await saveProductWithDiscount(data, id, user);
}

export async function deleteProduct(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    await Cart.updateMany(
        {},
        {
            $pull: {
                items: {
                    product: new mongoose.Types.ObjectId(id),
                },
            },
        }
    );

    await Product.findByIdAndDelete(id);

    return {
        id,
        name: product.name,
    };
}
