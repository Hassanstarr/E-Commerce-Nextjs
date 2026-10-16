"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Spinner from "@/components/ui/Spinner";
import { apiRequest } from "@/lib/api";

export default function StripeReturnPage() {
    return <ProtectedRoute><StripeReturnContent /></ProtectedRoute>;
}

function StripeReturnContent() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [message, setMessage] = useState("Confirming your payment. Please wait...");
    const [checking, setChecking] = useState(true);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (loading || !user) return;
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout>;
        let attempts = 0;
        const canceled = new URLSearchParams(window.location.search).get("canceled") === "1";

        const checkPayment = async () => {
            try {
                setChecking(true);
                const result = await apiRequest<{ data: { status: string; orderId: string | null } }>(
                    `/api/stripe/status/${id}`,
                    { method: canceled ? "POST" : "GET", signal: controller.signal }
                );
                if (controller.signal.aborted) return;
                if (result.data.orderId) {
                    router.replace(`/order-success/${result.data.orderId}`);
                    return;
                }
                if (["pending", "refund_pending"].includes(result.data.status) && ++attempts < 20) {
                    timer = setTimeout(checkPayment, 2000);
                    return;
                }
                setChecking(false);
                setMessage(result.data.status === "refunded"
                    ? "A product became unavailable. Your payment was refunded and no order was placed."
                    : ["failed", "canceled"].includes(result.data.status)
                        ? "Payment was not completed. No order was placed. Your cart is still available."
                        : "Your payment is still being processed. Check again before starting another payment.");
            } catch (error) {
                if (controller.signal.aborted) return;
                setChecking(false);
                setMessage(error instanceof Error ? error.message : "Unable to confirm your payment");
            }
        };
        checkPayment();
        return () => { controller.abort(); clearTimeout(timer); };
    }, [id, user, loading, router, retry]);

    return (
        <section className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
            <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Stripe Payment</h1>
                {checking && <div className="mt-6 flex justify-center"><Spinner /></div>}
                <p role="status" className="mt-4 text-gray-600">{message}</p>
                {!checking && (
                    <div className="mt-6 flex justify-center gap-3">
                        <button onClick={() => setRetry((value) => value + 1)} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">Check Payment Again</button>
                        <Link href="/checkout" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Back to Checkout</Link>
                    </div>
                )}
            </div>
        </section>
    );
}
