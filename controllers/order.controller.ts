import { NextRequest } from "next/server";
import { requireAuth } from "@/middleware/auth";
import { checkoutSchema } from "@/lib/validations";
import { createOrder } from "@/services/order.service";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";

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

        if (
            validation.data.customerEmail.toLowerCase() !==
            validation.data.confirmEmail.toLowerCase()
        ) {
            return errorResponse(
                "Email addresses do not match",
                400
            );
        }

        const order = await createOrder(
            user.userId,
            {
                customerName:
                    validation.data.customerName,

                customerEmail:
                    validation.data.customerEmail,

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