import mongoose from "mongoose";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import AppError from "@/lib/AppError";
import type { CreateOrderInput } from "@/types/order";
import nodemailer from "nodemailer";

const DELIVERY_FEE = 200;

export async function createOrder(
    userId: string,
    data: CreateOrderInput
) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError("Invalid user ID", 400);
    }

    const session = await mongoose.startSession();

    let order: mongoose.Document<any, any, any> & { _id: any } | undefined;

    try {
        await session.withTransaction(async () => {
            const cart = await Cart.findOne({
                user: userId,
            }).session(session);

            if (!cart || cart.items.length === 0) {
                throw new AppError(
                    "Your cart is empty",
                    400
                );
            }

            const productIds = cart.items.map(
                (item) => item.product
            );

            const products = await Product.find({
                _id: {
                    $in: productIds,
                },
            }).session(session);

            const productMap = new Map(
                products.map((product) => [
                    product._id.toString(),
                    product,
                ])
            );

            const orderItems = [];
            let subtotal = 0;

            for (const cartItem of cart.items) {
                const product = productMap.get(
                    cartItem.product.toString()
                );

                if (!product) {
                    throw new AppError(
                        "One or more products in your cart are no longer available",
                        409
                    );
                }

                if (cartItem.quantity > product.stock) {
                    throw new AppError(
                        `Only ${product.stock} item(s) of "${product.name}" are available`,
                        409
                    );
                }

                const itemTotal =
                    product.price * cartItem.quantity;

                subtotal += itemTotal;

                orderItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: cartItem.quantity,
                    image: product.image,
                });
            }

            for (const cartItem of cart.items) {
                const updatedProduct =
                    await Product.findOneAndUpdate(
                        {
                            _id: cartItem.product,
                            stock: {
                                $gte: cartItem.quantity,
                            },
                        },
                        {
                            $inc: {
                                stock: -cartItem.quantity,
                            },
                        },
                        {
                            new: true,
                            session,
                        }
                    );

                if (!updatedProduct) {
                    throw new AppError(
                        "Stock changed while placing your order. Please review your cart and try again.",
                        409
                    );
                }
            }

            const total = subtotal + DELIVERY_FEE;

            const [createdOrders] = await Order.create(
                [
                    {
                        user: new mongoose.Types.ObjectId(userId),
                        items: orderItems,
                        customerName: data.customerName,
                        customerEmail:
                            data.customerEmail
                                .trim()
                                .toLowerCase(),
                        phone: data.phone,
                        shippingAddress: {
                            address:
                                data.shippingAddress.address,
                            city: data.shippingAddress.city,
                            postalCode:
                                data.shippingAddress.postalCode,
                        },
                        subtotal,
                        deliveryFee: DELIVERY_FEE,
                        total,
                        paymentMethod: "cod",
                        paymentStatus: "pending",
                        orderStatus: "pending",
                    },
                ],
                {
                    session,
                }
            );

            order = createdOrders;

            cart.items = [];
            await cart.save({ session });
        });
    } finally {
        await session.endSession();
    }

    if (!order) {
        throw new AppError(
            "Unable to create order",
            500
        );
    }

    try {
        await sendOrderConfirmationEmail(order);
    } catch (error) {
        console.error(
            "Order confirmation email failed:",
            error
        );
    }

    return order;
}

async function sendOrderConfirmationEmail( order: any ) {
    if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASSWORD
    ) {
        console.error(
            "Email environment variables are missing"
        );

        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const itemLines = order.items
        .map(
            (item: any) =>
                `${item.name} x ${item.quantity} - Rs. ${
                    item.price * item.quantity
                }`
        )
        .join("\n");

    const text = `
        ShopEase Order Confirmation

        Hi ${order.customerName},

        Thank you for your order.

        Order ID:
        ${order._id}

        Payment Method:
        Cash on Delivery

        Products:
        ${itemLines}

        Subtotal:
        Rs. ${order.subtotal}

        Delivery:
        Rs. ${order.deliveryFee}

        Total:
        Rs. ${order.total}

        Shipping Address:
        ${order.shippingAddress.address}
        ${order.shippingAddress.city}
        ${order.shippingAddress.postalCode}

        Your order has been placed successfully and will be processed for delivery.

        Thank you for shopping with ShopEase.
        `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: order.customerEmail,
        subject: `ShopEase Order Confirmation - ${order._id}`,
        text,
    });
}