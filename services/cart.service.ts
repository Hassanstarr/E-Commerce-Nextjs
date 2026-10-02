import mongoose from "mongoose";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import AppError from "@/lib/AppError";

export async function getCart(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate({
        path: "items.product",
        select: "name price image stock category",
        populate: {
            path: "category",
            select: "name",
        },
    });

    if (!cart) {
        return {
            _id: null,
            items: [],
        };
    }

    return cart;
}

export async function addToCart(
    userId: string,
    productId: string,
    quantity: number
) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new AppError("Quantity must be at least 1", 400);
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    if (product.stock < quantity) {
        throw new AppError(
            `Only ${product.stock} item(s) available`,
            400
        );
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [
                {
                    product: productId,
                    quantity,
                },
            ],
        });

        return await getCart(userId);
    }

    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    );

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock) {
            throw new AppError(
                `Only ${product.stock} item(s) available`,
                400
            );
        }

        existingItem.quantity = newQuantity;
    } else {
        cart.items.push({
            product: new mongoose.Types.ObjectId(productId),
            quantity,
        });
    }

    await cart.save();

    return await getCart(userId);
}

export async function updateCartItem(
    userId: string,
    productId: string,
    quantity: number
) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new AppError("Quantity must be at least 1", 400);
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    if (quantity > product.stock) {
        throw new AppError(
            `Only ${product.stock} item(s) available`,
            400
        );
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const item = cart.items.find(
        (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
        throw new AppError("Product is not in your cart", 404);
    }

    item.quantity = quantity;

    await cart.save();

    return await getCart(userId);
}

export async function removeFromCart(
    userId: string,
    productId: string
) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product ID", 400);
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new AppError("Cart not found", 404);
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );

    if (cart.items.length === originalLength) {
        throw new AppError("Product is not in your cart", 404);
    }

    await cart.save();

    return await getCart(userId);
}

export async function clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return {
            _id: null,
            items: [],
        };
    }

    cart.items = [];

    await cart.save();

    return await getCart(userId);
}