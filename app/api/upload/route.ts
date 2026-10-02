import { NextRequest } from "next/server";
import { requireAdmin } from "@/middleware/admin";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";
import AppError from "@/lib/AppError";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();

        const formData = await req.formData();

        const file = formData.get("file");

        if (!(file instanceof File)) {
            return errorResponse(
                "Image file is required",
                400
            );
        }

        if (!file.type.startsWith("image/")) {
            return errorResponse(
                "Only image files are allowed",
                400
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            return errorResponse(
                "Image size cannot exceed 5MB",
                400
            );
        }

        const bytes = await file.arrayBuffer();

        const buffer = Buffer.from(bytes);

        const result = await new Promise<{ secure_url: string; }>((resolve, reject) => {
            const uploadStream =
                cloudinary.uploader.upload_stream(
                    {
                        folder: "shopease",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (!result) {
                            reject(
                                new Error(
                                    "Cloudinary upload failed"
                                )
                            );
                            return;
                        }

                        resolve({
                            secure_url: result.secure_url,
                        });
                    }
                );

            uploadStream.end(buffer);
        });

        return successResponse(
            {
                url: result.secure_url,
            },
            "Image uploaded successfully",
            201
        );
    } catch (error) {
        if (error instanceof AppError) {
            return errorResponse(
                error.message,
                error.statusCode
            );
        }

        console.error("Image upload error:", error);
        if (error && typeof error === 'object') {
            console.error("Cloudinary error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }

        return errorResponse(
            "Unable to upload image",
            500
        );
    }
}