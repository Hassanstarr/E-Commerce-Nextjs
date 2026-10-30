import { z } from "zod";
import {
    signupSchema, verifySignupSchema, loginSchema, forgotPasswordSchema,
    verifyPasswordResetSchema, resetPasswordSchema, accountProfileSchema,
    changePasswordSchema, categorySchema, productSchema, checkoutSchema,
} from "@/lib/validations";
import { subscriptionSchema } from "@/lib/subscription";
import { chatReadSchema } from "@/lib/chat-validation";

// Keep request definitions aligned with the application's existing validation.
const schemas = {
    Signup: signupSchema,
    VerifySignup: verifySignupSchema,
    Login: loginSchema,
    ForgotPassword: forgotPasswordSchema,
    VerifyResetCode: verifyPasswordResetSchema,
    ResetPassword: resetPasswordSchema,
    Profile: accountProfileSchema,
    ChangePassword: changePasswordSchema,
    Category: categorySchema,
    Product: productSchema,
    Checkout: checkoutSchema,
    StripeCheckout: checkoutSchema.extend({ paymentMethod: z.literal("stripe"), requestId: z.uuid() }),
    EmailVerification: z.object({ email: z.email(), otp: z.string().regex(/^\d{6}$/).optional() }),
    CartItem: z.object({ productId: z.string().regex(/^[a-f\d]{24}$/i), quantity: z.number().int().min(1) }),
    ProductId: z.object({ productId: z.string().regex(/^[a-f\d]{24}$/i) }),
    GoogleLogin: z.object({ credential: z.string().min(1).max(10000) }),
    Subscription: subscriptionSchema,
    MembershipAction: z.object({ action: z.enum(["checkout", "cancel"]) }),
    ChatRead: chatReadSchema,
    NotificationAction: z.discriminatedUnion("action", [
        z.object({ action: z.literal("connect") }),
        z.object({ action: z.literal("read"), id: z.string() }),
        z.object({ action: z.literal("read-all") }),
    ]),
    OrderUpdate: z.object({
        orderStatus: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
        paymentStatus: z.enum(["pending", "paid", "refunded"]).optional(),
        restock: z.boolean().optional(),
        retryRefund: z.boolean().optional(),
        note: z.string().max(1000).optional(),
    }),
    Contact: z.object({ name: z.string().min(1), email: z.string().min(1), message: z.string().min(1) }),
};

type SchemaName = keyof typeof schemas;
type Parameter = { name: string; in: string; required?: boolean; description?: string; schema: Record<string, unknown> };
type Operation = {
    summary: string;
    tags: string[];
    description: string;
    security: Record<string, string[]>[];
    responses: Record<string, unknown>;
    parameters?: Parameter[];
    requestBody?: Record<string, unknown>;
};
const paths: Record<string, Record<string, Operation>> = {};
const session = [{ cookieAuth: [] }];
const query = (name: string, description: string, schema: Record<string, unknown> = { type: "string" }): Parameter => ({ name, in: "query", description, schema });
const page = query("page", "Page number", { type: "integer", minimum: 1, default: 1 });
const limit = query("limit", "Items per page (maximum 100)", { type: "integer", minimum: 1, maximum: 100, default: 10 });
const search = query("search", "Search text");
const error = { description: "Request rejected", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } };

function add(path: string, method: string, tag: string, summary: string, options: {
    access?: "public" | "customer" | "admin" | "cron" | "stripe";
    body?: SchemaName;
    parameters?: Parameter[];
    description?: string;
    status?: number;
} = {}) {
    const access = options.access || "customer";
    const description = {
        public: "Public endpoint. No login required.",
        customer: "Requires a logged-in account. Ownership checks and endpoint-specific restrictions still apply.",
        admin: "Requires an admin account.",
        cron: "Requires Authorization: Bearer CRON_SECRET. Runs the real scheduled job.",
        stripe: "Requires a valid Stripe-Signature generated for the exact raw request body. Use Stripe CLI for testing.",
    }[access];
    const operation: Operation = {
        summary,
        tags: [tag],
        description: `${description}${options.description ? ` ${options.description}` : ""}`,
        security: access === "public" ? [] : access === "cron" ? [{ cronSecret: [] }] : access === "stripe" ? [{ stripeSignature: [] }] : session,
        responses: {
            [options.status || 200]: { description: "Success. The data field contains the endpoint's result.", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            "400": error, "401": error, "403": error, "404": error, "409": error,
            "429": { ...error, description: "Rate limit exceeded. Wait before retrying." },
            "500": error, "503": error,
        },
    };
    const parameters = [...(options.parameters || [])];
    if (path.includes("{id}")) parameters.unshift({ name: "id", in: "path", required: true, description: path.includes("/stripe/status/") ? "Local checkoutId returned by checkout creation (24 hexadecimal characters), not the Stripe cs_ session ID" : "Full MongoDB ObjectId (24 hexadecimal characters)", schema: { type: "string", pattern: "^[a-fA-F0-9]{24}$" } });
    if (parameters.length) operation.parameters = parameters;
    if (options.body) operation.requestBody = { required: true, content: { "application/json": { schema: { $ref: `#/components/schemas/${options.body}` } } } };
    (paths[path] ||= {})[method] = operation;
}

add("/api/auth/signup", "post", "Authentication", "Request registration email code", { access: "public", body: "Signup" });
add("/api/auth/verify-signup", "post", "Authentication", "Verify code and create account", { access: "public", body: "VerifySignup", status: 201, description: "Requires the signup_verification cookie from the signup request; successful verification sets auth_token." });
add("/api/auth/resend-signup-code", "post", "Authentication", "Resend registration code", { access: "public", description: "Requires the signup_verification cookie from the signup request." });
add("/api/auth/login", "post", "Authentication", "Log in", { access: "public", body: "Login", description: "Sets the HttpOnly auth_token cookie used by subsequent requests." });
add("/api/auth/logout", "post", "Authentication", "Log out and clear session", { access: "public" });
add("/api/auth/me", "get", "Authentication", "Get current account");
add("/api/auth/google", "get", "Authentication", "Create Google sign-in nonce", { access: "public" });
add("/api/auth/google", "post", "Authentication", "Sign in with Google credential", { access: "public", body: "GoogleLogin", description: "First obtain a nonce, then obtain a Google ID credential with that nonce through Google sign-in." });
add("/api/auth/forgot-password", "post", "Authentication", "Request password reset code", { access: "public", body: "ForgotPassword" });
add("/api/auth/verify-reset-code", "post", "Authentication", "Verify password reset code", { access: "public", body: "VerifyResetCode", description: "Returns a reset token for the reset-password request." });
add("/api/auth/reset-password", "post", "Authentication", "Reset password", { access: "public", body: "ResetPassword" });
add("/api/account", "patch", "Account", "Update account name", { body: "Profile" });
add("/api/account/password", "put", "Account", "Change password", { body: "ChangePassword" });

add("/api/products", "get", "Products", "List products", { access: "public", parameters: [query("category", "Filter by category ObjectId")], description: "Optional login determines membership pricing. Returns the full list; the storefront paginates on the client." });
add("/api/products", "post", "Products", "Create product", { access: "admin", body: "Product", status: 201 });
add("/api/products/{id}", "get", "Products", "Get product", { access: "public", description: "Optional login determines membership pricing." });
add("/api/products/{id}", "put", "Products", "Update product and discounts", { access: "admin", body: "Product", description: "Member discounts cannot be below the active everyone discount. Discount end times must be in the future. Server validation remains authoritative." });
add("/api/products/{id}", "delete", "Products", "Delete product", { access: "admin" });
add("/api/categories", "get", "Categories", "List categories", { access: "public", description: "Returns the full list; the storefront paginates on the client." });
add("/api/categories", "post", "Categories", "Create category", { access: "admin", body: "Category", status: 201 });
add("/api/categories/{id}", "get", "Categories", "Get category", { access: "public" });
add("/api/categories/{id}", "put", "Categories", "Update category", { access: "admin", body: "Category" });
add("/api/categories/{id}", "delete", "Categories", "Delete category", { access: "admin" });
add("/api/upload", "post", "Products", "Upload product or category image", { access: "admin", description: "Image only, maximum 5 MB." });
paths["/api/upload"].post.requestBody = { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["file"], properties: { file: { type: "string", format: "binary" } } } } } };

add("/api/cart", "get", "Cart", "Get your cart");
add("/api/cart", "post", "Cart", "Add product to cart", { body: "CartItem", status: 201 });
add("/api/cart", "delete", "Cart", "Clear your cart");
add("/api/cart/item", "put", "Cart", "Update cart item quantity", { body: "CartItem" });
add("/api/cart/item", "delete", "Cart", "Remove cart item", { body: "ProductId" });
add("/api/wishlist", "get", "Wishlist", "Get your wishlist");
add("/api/wishlist", "post", "Wishlist", "Add wishlist product", { body: "ProductId", status: 201 });
add("/api/wishlist/item", "delete", "Wishlist", "Remove wishlist product", { body: "ProductId" });
add("/api/checkout/verify-email", "post", "Orders", "Verify checkout email", { body: "EmailVerification", description: "Omit otp to check verification or send a code. Already verified emails are not sent another code. Supply otp to verify." });
add("/api/orders", "get", "Orders", "List your orders", { parameters: [page] });
add("/api/orders", "post", "Orders", "Place cash on delivery order", { body: "Checkout", status: 201, description: "Requires a nonempty cart and verified checkout email. COD payment starts pending." });
add("/api/stripe/checkout", "post", "Payments", "Create Stripe order checkout", { body: "StripeCheckout", description: "Requires a nonempty cart and verified checkout email. Reuse requestId when retrying the same payment. Returns a Stripe checkout URL; open it to pay." });
add("/api/stripe/status/{id}", "get", "Payments", "Check your Stripe checkout status");
add("/api/stripe/status/{id}", "post", "Payments", "Cancel your pending Stripe checkout");
add("/api/stripe/webhook", "post", "Payments", "Receive Stripe payment and membership events", { access: "stripe" });
paths["/api/stripe/webhook"].post.requestBody = { required: true, content: { "application/json": { schema: { type: "object", description: "Stripe event payload. Signature must match these exact bytes." } } } };
add("/api/membership", "get", "Membership", "Get monthly membership", { parameters: [query("checkout", "Optional Stripe Checkout Session ID to synchronize")], description: "Customer accounts only; admin accounts receive 403." });
add("/api/membership", "post", "Membership", "Start or cancel monthly membership", { body: "MembershipAction", description: "Customer accounts only. checkout returns a Stripe card checkout URL. cancel stops renewal while retaining membership until the paid period ends." });
add("/api/subscription", "get", "Email subscriptions", "Get email subscription preferences");
add("/api/subscription", "put", "Email subscriptions", "Save email subscription preferences", { body: "Subscription" });
add("/api/notifications", "get", "Notifications", "List your notifications", { parameters: [query("filter", "Inbox filter", { type: "string", enum: ["all", "unread"], default: "all" }), query("cursor", "Cursor returned by the previous page")] });
add("/api/notifications", "post", "Notifications", "Connect live inbox or mark notifications read", { body: "NotificationAction", description: "connect returns a short-lived Firebase custom token. read requires the notification id; read-all marks your inbox read." });

add("/api/chat", "get", "Chat", "Get or create your support conversation");
add("/api/chat/{id}/messages", "get", "Chat", "Get conversation messages", { parameters: [query("before", "Load messages before this sequence", { type: "integer", minimum: 1 })], description: "Only the conversation owner or an admin can access messages." });
add("/api/chat/{id}/read", "patch", "Chat", "Mark conversation read", { body: "ChatRead" });
add("/api/chat/socket", "get", "Chat", "Upgrade to live chat WebSocket", { description: "WebSocket transport, not a REST message endpoint. Swagger cannot open WebSockets; use the website's chat interface. Local development uses the separate npm run dev:chat server." });
paths["/api/chat/socket"].get.responses = { "101": { description: "WebSocket connection established" }, "401": error, "403": error, "429": error, "503": error };
add("/api/admin/chats", "get", "Admin", "List customer conversations", { access: "admin", parameters: [page, search, query("filter", "Use unread to show unread conversations", { type: "string", enum: ["unread"] })] });
add("/api/admin/dashboard", "get", "Admin", "Get dashboard totals", { access: "admin" });
add("/api/admin/orders", "get", "Admin", "List and search orders", { access: "admin", parameters: [page, limit, query("search", "Search order ID or customer"), query("orderStatus", "Filter order status"), query("paymentStatus", "Filter payment status")] });
add("/api/admin/orders/{id}", "get", "Admin", "Get order details", { access: "admin" });
add("/api/admin/orders/{id}", "patch", "Admin", "Update order status, payment or note", { access: "admin", body: "OrderUpdate", description: "Existing transition rules apply: adjacent order steps, cancellation and restoration to the previous status. Payment changes remain restricted by the order/payment rules. A note can be sent alone." });
add("/api/admin/orders/{id}/history", "get", "Admin", "Get order history", { access: "admin" });
add("/api/admin/customers", "get", "Admin", "List customers", { access: "admin", parameters: [page, limit, search] });
add("/api/admin/customers/{id}", "get", "Admin", "Get customer details", { access: "admin" });
add("/api/admin/analytics", "get", "Admin", "Get analytics", { access: "admin", parameters: [query("period", "Analytics period in days (default 30)")] });
add("/api/admin/activity", "get", "Admin", "List activity logs", { access: "admin", parameters: [page, { ...limit, schema: { ...limit.schema, default: 20 } }, search, query("type", "Activity action filter")] });
add("/api/contact", "post", "Contact", "Send store contact message", { access: "public", body: "Contact" });
add("/api/cron/subscriptions", "get", "Scheduled jobs", "Process subscription emails", { access: "cron" });
add("/api/cron/notifications", "get", "Scheduled jobs", "Process scheduled notifications", { access: "cron" });
add("/api/docs", "get", "Documentation", "Get this OpenAPI definition", { access: "public", description: "Unrestricted only in development. In production, requires an admin session (401 for guests, 403 for customers).", });
paths["/api/docs"].get.security = process.env.NODE_ENV === "development" ? [] : session;
paths["/api/docs"].get.description = "Unrestricted only in development. In production, requires an admin session (401 for guests, 403 for customers).";
paths["/api/docs"].get.responses["200"] = { description: "OpenAPI 3.0 JSON document" };

export const openApiDocument = {
    // Avoid Swagger's ApiDOM 3.1 resolver, which fails under Turbopack.
    openapi: "3.0.3",
    info: {
        title: "ShopEase API",
        version: "1.0.0",
        description: "Same-origin ShopEase API. Log in on this website before testing customer or admin endpoints; the browser sends the HttpOnly auth_token cookie automatically. No manual cookie authorization is needed. Public endpoints stay public. Existing authorization, ownership, validation, origin checks and rate limits apply. Mutations make real changes. Request schemas reuse Zod validation; cross-field refinements are enforced by the server. WebSockets are described here but tested through Chat.",
    },
    servers: [{ url: "/", description: "Current website" }],
    tags: ["Authentication", "Account", "Products", "Categories", "Cart", "Wishlist", "Orders", "Payments", "Membership", "Email subscriptions", "Notifications", "Chat", "Admin", "Contact", "Scheduled jobs", "Documentation"].map((name) => ({ name })),
    paths,
    components: {
        securitySchemes: {
            cookieAuth: { type: "apiKey", in: "cookie", name: "auth_token", description: "Log in through /auth/login on this same website. The browser manages this HttpOnly cookie; do not paste a token here." },
            cronSecret: { type: "http", scheme: "bearer", description: "Server CRON_SECRET; not a customer session." },
            stripeSignature: { type: "apiKey", in: "header", name: "Stripe-Signature", description: "Stripe-signed event signature. Prefer Stripe CLI testing." },
        },
        schemas: {
            ...Object.fromEntries(Object.entries(schemas).map(([name, schema]) => {
                const { $schema, ...definition } = z.toJSONSchema(schema, { target: "openapi-3.0", io: "input", unrepresentable: "any" });
                void $schema;
                return [name, definition];
            })),
            Success: { type: "object", required: ["success", "data"], properties: { success: { type: "boolean", enum: [true] }, message: { type: "string" }, data: { description: "Endpoint-specific result; inspect the live response." } } },
            Error: { type: "object", required: ["success", "message"], properties: { success: { type: "boolean", enum: [false] }, message: { type: "string" }, errors: {} } },
        },
    },
};
