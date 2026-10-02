import mongoose from "mongoose";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import AppError from "@/lib/AppError";

export async function getWishlist(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId }).populate({
        path: "products",
        select: "name description price image stock category",
        populate: {
            path: "category",
            select: "name",
        },
    });

    if (!wishlist) {
        return {
            _id: null,
            products: [],
        };
    }

    return wishlist;
}

export async function addToWishlist( userId: string, productId: string ) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        wishlist = await Wishlist.create({
            user: userId,
            products: [new mongoose.Types.ObjectId(productId)],
        });

        return await getWishlist(userId);
    }

    const alreadyExists = wishlist.products.some(
        (product) => product.toString() === productId
    );

    if (alreadyExists) {
        throw new AppError(
            "Product is already in your wishlist",
            400
        );
    }

    wishlist.products.push(
        new mongoose.Types.ObjectId(productId)
    );

    await wishlist.save();

    return await getWishlist(userId);
}

export async function removeFromWishlist( userId: string, productId: string ) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        throw new AppError("Wishlist not found", 404);
    }

    const originalLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
        (product) => product.toString() !== productId
    );

    if (wishlist.products.length === originalLength) {
        throw new AppError(
            "Product is not in your wishlist",
            404
        );
    }

    await wishlist.save();

    return await getWishlist(userId);
}