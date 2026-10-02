import { apiRequest } from "@/lib/api";

export async function submitContactForm(data: {
    name: string;
    email: string;
    message: string;
}) {
    return apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
    });
}