import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Cart from "@/models/Cart";
import AppError from "@/lib/AppError";
import type { ProductInput } from "@/lib/validations";
import { expireProductDiscounts, saveProductWithDiscount } from "@/services/discount.service";

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

export async function getProducts(categoryId?: string) {
    await expireProductDiscounts();
    const filter: { category?: string } = {};

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

    return await Product.find(filter)
        .populate("category", "name image")
        .sort({ createdAt: -1 });
}

export async function getProductById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid product ID", 400);
    }

    await expireProductDiscounts();
    const product = await Product.findById(id).populate(
        "category",
        "name image"
    );

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
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
