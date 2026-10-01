import mongoose from "mongoose";
import Product from "@/models/Product";
import Category from "@/models/Category";
import AppError from "@/lib/AppError";
import type { ProductInput } from "@/lib/validations";

export async function createProduct(data: ProductInput) {
    if (!mongoose.Types.ObjectId.isValid(data.category)) {
        throw new AppError("Invalid category ID", 400);
    }

    const category = await Category.findById(data.category);

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    const product = await Product.create({
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        stock: data.stock,
    });

    return await product.populate("category");
}

export async function getProducts(categoryId?: string) {
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

    const product = await Product.findById(id).populate(
        "category",
        "name image"
    );

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
}

export async function updateProduct( id: string, data: ProductInput ) {
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

    product.name = data.name;
    product.description = data.description;
    product.price = data.price;
    product.image = data.image;
    product.category = category._id;
    product.stock = data.stock;

    await product.save();

    return await product.populate("category");
}

export async function deleteProduct(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    await Product.findByIdAndDelete(id);

    return {
        id,
    };
}