import Link from "next/link";
import { notFound } from "next/navigation";

type OrderItem = {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
};

type OrderDetails = {
    _id: string;
    customerName: string;
    customerEmail: string;
    phone: string;
    shippingAddress: {
        address: string;
        city: string;
        province: string;
        postalCode: string;
    };
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod: "COD" | "Card";
    paymentStatus: "Pending" | "Paid" | "Failed";
    orderStatus:
        | "Pending"
        | "Confirmed"
        | "Shipped"
        | "Delivered"
        | "Cancelled";
    createdAt: string;
};

const mockOrders: OrderDetails[] = [
    {
        _id: "ORD-1001",
        customerName: "Ali Raza",
        customerEmail: "ali@example.com",
        phone: "+92 300 1234567",
        shippingAddress: {
            address: "House 24, Street 8",
            city: "Lahore",
            province: "Punjab",
            postalCode: "54000",
        },
        items: [
            {
                productId: "product-1",
                name: "Wireless Headphones",
                image: "https://placehold.co/100x100",
                price: 7500,
                quantity: 1,
            },
            {
                productId: "product-2",
                name: "Mechanical Keyboard",
                image: "https://placehold.co/100x100",
                price: 5000,
                quantity: 1,
            },
        ],
        subtotal: 12500,
        deliveryFee: 200,
        total: 12700,
        paymentMethod: "COD",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        createdAt: "2026-10-05T10:30:00",
    },
    {
        _id: "ORD-1002",
        customerName: "Ahmed Khan",
        customerEmail: "ahmed@example.com",
        phone: "+92 301 7654321",
        shippingAddress: {
            address: "Apartment 12, Main Boulevard",
            city: "Lahore",
            province: "Punjab",
            postalCode: "54660",
        },
        items: [
            {
                productId: "product-3",
                name: "Smart Watch",
                image: "https://placehold.co/100x100",
                price: 8400,
                quantity: 1,
            },
        ],
        subtotal: 8400,
        deliveryFee: 200,
        total: 8600,
        paymentMethod: "Card",
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        createdAt: "2026-10-04T15:20:00",
    },
    {
        _id: "ORD-1003",
        customerName: "Sara Malik",
        customerEmail: "sara@example.com",
        phone: "+92 302 9876543",
        shippingAddress: {
            address: "House 18, Model Town",
            city: "Lahore",
            province: "Punjab",
            postalCode: "54700",
        },
        items: [
            {
                productId: "product-4",
                name: "Wireless Headphones",
                image: "https://placehold.co/100x100",
                price: 5000,
                quantity: 2,
            },
            {
                productId: "product-5",
                name: "Laptop Stand",
                image: "https://placehold.co/100x100",
                price: 11900,
                quantity: 1,
            },
        ],
        subtotal: 21900,
        deliveryFee: 200,
        total: 22100,
        paymentMethod: "Card",
        paymentStatus: "Paid",
        orderStatus: "Shipped",
        createdAt: "2026-10-03T11:45:00",
    },
];

function getOrder(orderId: string) {
    return mockOrders.find((order) => order._id === orderId);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-PK", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getStatusClass(
    status: OrderDetails["orderStatus"]
) {
    switch (status) {
        case "Delivered":
            return "border-green-200 bg-green-50 text-green-700";

        case "Shipped":
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "Confirmed":
            return "border-indigo-200 bg-indigo-50 text-indigo-700";

        case "Pending":
            return "border-amber-200 bg-amber-50 text-amber-700";

        case "Cancelled":
            return "border-red-200 bg-red-50 text-red-700";

        default:
            return "border-gray-200 bg-gray-50 text-gray-700";
    }
}

function getPaymentClass(
    status: OrderDetails["paymentStatus"]
) {
    switch (status) {
        case "Paid":
            return "border-green-200 bg-green-50 text-green-700";

        case "Failed":
            return "border-red-200 bg-red-50 text-red-700";

        case "Pending":
            return "border-amber-200 bg-amber-50 text-amber-700";

        default:
            return "border-gray-200 bg-gray-50 text-gray-700";
    }
}

export default async function AdminOrderDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const order = getOrder(id);

    if (!order) {
        notFound();
    }

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">


                <div className="mb-8">
                    <Link
                        href="/admin/orders"
                        className="text-sm font-medium text-gray-500 transition hover:text-black"
                    >
                        ← Back to Orders
                    </Link>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Order Details
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-gray-900">
                                #{order._id}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Placed on{" "}
                                {formatDate(order.createdAt)}
                            </p>
                        </div>

                        <span
                            className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusClass(
                                order.orderStatus
                            )}`}
                        >
                            {order.orderStatus}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">


                    <div className="space-y-6 lg:col-span-2">


                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <h2 className="font-semibold text-gray-900">
                                    Order Items
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {order.items.length}{" "}
                                    {order.items.length === 1
                                        ? "product"
                                        : "products"}
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="flex gap-4 px-5 py-5"
                                    >
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-gray-900">
                                                {item.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Rs.{" "}
                                                {item.price.toLocaleString()}{" "}
                                                × {item.quantity}
                                            </p>
                                        </div>

                                        <p className="font-semibold text-gray-900">
                                            Rs.{" "}
                                            {(
                                                item.price *
                                                item.quantity
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>


                            <div className="border-t border-gray-200 px-5 py-5">
                                <div className="ml-auto max-w-sm space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal</span>

                                        <span>
                                            Rs.{" "}
                                            {order.subtotal.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Delivery Fee</span>

                                        <span>
                                            Rs.{" "}
                                            {order.deliveryFee.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                                        <span>Total</span>

                                        <span>
                                            Rs.{" "}
                                            {order.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Order Timeline
                            </h2>

                            <div className="mt-6 space-y-5">
                                <div className="flex gap-4">
                                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-black" />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Order placed
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div
                                        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                            order.orderStatus ===
                                                "Confirmed" ||
                                            order.orderStatus ===
                                                "Shipped" ||
                                            order.orderStatus ===
                                                "Delivered"
                                                ? "bg-black"
                                                : "bg-gray-300"
                                        }`}
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Confirmed
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Order confirmation
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div
                                        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                            order.orderStatus ===
                                                "Shipped" ||
                                            order.orderStatus ===
                                                "Delivered"
                                                ? "bg-black"
                                                : "bg-gray-300"
                                        }`}
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Shipped
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Order handed to delivery
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div
                                        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                                            order.orderStatus ===
                                            "Delivered"
                                                ? "bg-black"
                                                : "bg-gray-300"
                                        }`}
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Delivered
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Order delivered to customer
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="space-y-6">


                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Customer
                            </h2>

                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {order.customerName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Email
                                    </p>

                                    <p className="mt-1 break-all text-sm text-gray-700">
                                        {order.customerEmail}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm text-gray-700">
                                        {order.phone}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Shipping Address
                            </h2>

                            <div className="mt-4 text-sm leading-6 text-gray-600">
                                <p>
                                    {
                                        order.shippingAddress
                                            .address
                                    }
                                </p>

                                <p>
                                    {
                                        order.shippingAddress.city
                                    }
                                    ,{" "}
                                    {
                                        order.shippingAddress
                                            .province
                                    }
                                </p>

                                <p>
                                    {
                                        order.shippingAddress
                                            .postalCode
                                    }
                                </p>
                            </div>
                        </div>


                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Payment
                            </h2>

                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Method
                                    </span>

                                    <span className="text-sm font-medium text-gray-900">
                                        {order.paymentMethod}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        Status
                                    </span>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentClass(
                                            order.paymentStatus
                                        )}`}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>


                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <h2 className="font-semibold text-gray-900">
                                Order Actions
                            </h2>

                            <div className="mt-4 space-y-3">
                                <button
                                    type="button"
                                    className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                                >
                                    Update Status
                                </button>

                                <button
                                    type="button"
                                    className="w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    Cancel Order
                                </button>
                            </div>

                            <p className="mt-3 text-xs leading-5 text-gray-400">
                                Status changes will be connected to
                                the admin API later.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}