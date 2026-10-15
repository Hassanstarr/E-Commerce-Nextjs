import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { checkoutSchema } from "@/lib/validations";
import { createOrder, getMyOrders } from "@/services/order.service";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import { isCheckoutEmailVerified } from "@/services/email-verification.service";

export async function getMyOrdersController(req: NextRequest) {
    try {
        const user = await requireAuth();
        const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
        const data = await getMyOrders(user.userId, page);

        return successResponse(data, "Orders fetched successfully");
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        console.error("Get my orders error:", error);
        return errorResponse("Unable to fetch your orders", 500);
    }
}

export async function createOrderController( req: NextRequest ) {
    try {
        const user = await requireAuth();

        const body = await req.json();

        const validation = checkoutSchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(
                validation.error.issues
                    .map((issue) => issue.message)
                    .join(", "),
                400
            );
        }

        if (!await isCheckoutEmailVerified(
            user.userId,
            validation.data.customerEmail
        )) {
            return errorResponse(
                "Please verify your email before placing an order",
                400
            );
        }

        const order = await createOrder(
            user.userId,
            {
                customerName: validation.data.customerName,
                customerEmail: validation.data.customerEmail,
                phone: validation.data.phone,

                shippingAddress: {
                    address:
                        validation.data.address,
                    city:
                        validation.data.city,
                    postalCode:
                        validation.data.postalCode,
                },

                paymentMethod: "cod",
            }
        );

        return successResponse(
            {
                orderId: order._id.toString(),
                order,
            },
            "Order placed successfully",
            201
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error(
            "Create order error:",
            error
        );

        return errorResponse(
            "Unable to place order",
            500
        );
    }
}