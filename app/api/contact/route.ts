import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { successResponse } from "@/lib/apiResponse";
import { errorResponse } from "@/lib/apiError";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { name, email, message } = body;

        if (!name || !email || !message) {
            return errorResponse(
                "Name, email and message are required",
                400
            );
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `ShopEase Contact Form: ${name}`,
            text: `
                Name: ${name}
                Email: ${email}

                Message:
                ${message}

                Sent from: ShopEase
                Website: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                            `,
            html: `
                <h2>New Contact Form Submission</h2>

                <p>
                    <strong>Name:</strong> ${name}
                </p>

                <p>
                    <strong>Email:</strong> ${email}
                </p>

                <h3>Message</h3>

                <p>${message}</p>

                <hr />

                <p>
                    <strong>Sent from:</strong> ShopEase
                </p>

                <p>
                    <strong>Website:</strong>
                    ${
                        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                    }
                </p>
            `,
        });

        return successResponse(
            null,
            "Message sent successfully"
        );
    } catch (error) {
        console.error("Contact form error:", error);

        return errorResponse(
            "Unable to send message",
            500
        );
    }
}