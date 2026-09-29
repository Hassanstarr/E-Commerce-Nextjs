import { connectDB } from "@/lib/db";
import { meController } from "@/controllers/auth.controller";

export async function GET() {
    await connectDB();

    return meController();
}