import { z } from "zod";

export const signupSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(6, "Password must contain at least 6 characters")
        .max(100, "Password cannot exceed 100 characters"),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});


export const categorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Category name must contain at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters"),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

    image: z
        .string()
        .trim()
        .url("Image must be a valid URL")
        .optional()
        .or(z.literal("")),
});


export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;