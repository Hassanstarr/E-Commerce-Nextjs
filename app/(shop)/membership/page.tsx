import { redirect } from "next/navigation";
import { requireAuth } from "@/middleware/auth";
import AppError from "@/lib/AppError";
import MembershipSettings from "@/components/account/MembershipSettings";

export default async function MembershipPage() {
    try {
        const user = await requireAuth();
        if (user.role === "admin") redirect("/admin");
    } catch (error) {
        if (error instanceof AppError && error.statusCode === 401) redirect("/auth/login?next=/membership");
        throw error;
    }
    return <MembershipSettings />;
}
