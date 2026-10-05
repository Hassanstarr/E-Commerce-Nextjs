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

export const productSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Product name must contain at least 2 characters")
        .max(100, "Product name cannot exceed 100 characters"),

    description: z
        .string()
        .trim()
        .min(10, "Description must contain at least 10 characters")
        .max(2000, "Description cannot exceed 2000 characters"),

    price: z
        .number()
        .min(1, "Please enter a valid price greater than 0."),

    image: z
        .string()
        .trim()
        .url("Image must be a valid URL"),

    category: z
        .string()
        .trim()
        .min(1, "Category is required"),

    stock: z
        .number()
        .int("Stock must be a whole number")
        .min(0, "Stock cannot be negative"),
});

export const checkoutSchema = z.object({
    customerName: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),

    customerEmail: z
        .string()
        .trim()
        .email("Please enter a valid email address"),

    confirmEmail: z
        .string()
        .trim()
        .email("Please enter a valid confirmation email"),

    phone: z
        .string()
        .trim()
        .min(7, "Phone number is required")
        .max(20, "Phone number cannot exceed 20 characters"),

    address: z
        .string()
        .trim()
        .min(5, "Address must contain at least 5 characters")
        .max(300, "Address cannot exceed 300 characters"),

    city: z
        .string()
        .trim()
        .min(2, "City must contain at least 2 characters")
        .max(100, "City cannot exceed 100 characters"),

    postalCode: z
        .string()
        .trim()
        .min(3, "Postal code is required")
        .max(20, "Postal code cannot exceed 20 characters"),

    paymentMethod: z.literal("cod"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ChectutInput = z.infer<typeof checkoutSchema>;