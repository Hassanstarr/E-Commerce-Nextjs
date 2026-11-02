import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const development = process.env.NODE_ENV === "development";
    const policy = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://apis.google.com https://www.gstatic.com https://js.stripe.com${development ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline' https://accounts.google.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src 'self' https://accounts.google.com https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://*.cloudinary.com wss:${development ? " ws:" : ""}`,
        "frame-src https://accounts.google.com https://*.firebaseapp.com https://js.stripe.com https://hooks.stripe.com",
        "worker-src 'self' blob:",
        "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
    ].join("; ");
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", policy);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("Content-Security-Policy", policy);
    return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
