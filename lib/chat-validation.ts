import { z } from "zod";

export const chatIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid conversation ID");
export const chatSendSchema = z.object({
    conversationId: chatIdSchema,
    clientMessageId: z.string().uuid("Invalid message ID"),
    text: z.string().trim().min(1, "Enter a message").max(2000, "Messages cannot exceed 2000 characters"),
});
export const chatReadSchema = z.object({
    sequence: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});
