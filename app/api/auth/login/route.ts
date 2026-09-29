import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { loginController } from "@/controllers/auth.controller";

export async function POST(req: NextRequest) {
    await connectDB();

    return loginController(req);
}