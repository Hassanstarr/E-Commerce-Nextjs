import { adminTestController } from "@/controllers/auth.controller";

export async function GET() {
    return adminTestController();
}