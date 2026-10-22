import { redirect } from "next/navigation";
import { requireAuth } from "@/middleware/auth";
import AppError from "@/lib/AppError";
import SubscriptionSettings from "@/components/account/SubscriptionSettings";

export default async function SubscriptionPage() {
    try {
        await requireAuth();
    } catch (error) {
        if (error instanceof AppError && error.statusCode === 401) {
            redirect("/auth/login?next=/subscription");
        }
        throw error;
    }
    return <SubscriptionSettings />;
}
