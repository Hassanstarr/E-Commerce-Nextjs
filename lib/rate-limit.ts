
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export type RateLimiter = Pick<Ratelimit, "limit">;

function createLimiter(config: Omit<ConstructorParameters<typeof Ratelimit>[0], "redis">): RateLimiter {
    let limiter: Ratelimit | undefined;
    return {
        limit(...args: Parameters<Ratelimit["limit"]>) {
            limiter ||= new Ratelimit({ ...config, redis: Redis.fromEnv() });
            return limiter.limit(...args);
        },
    };
}

export const rateLimiters = {
    notificationsRead: createLimiter({ timeout: 1500, limiter: Ratelimit.slidingWindow(120, "1 m"), prefix: "shopease:notifications-read" }),
    notificationsWrite: createLimiter({ timeout: 1500, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "shopease:notifications-write" }),
    chatBot: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "shopease:chat-bot",
    }),

    signupVerify: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(20, "10 m"),
        prefix: "shopease:signup-verify",
    }),

    signupResend: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "shopease:signup-resend",
    }),

    chatConnection: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        prefix: "shopease:chat-connection",
    }),

    chatRead: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(300, "1 m"),
        prefix: "shopease:chat-read",
    }),

    chatMessage: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "shopease:chat-message",
    }),
    accountUpdate: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        prefix: "shopease:account-update",
    }),

    passwordChange: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "shopease:password-change",
    }),

    passwordResetRequest: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "shopease:password-reset-request",
    }),

    passwordReset: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(10, "10 m"),
        prefix: "shopease:password-reset",
    }),
    general: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        prefix: "shopease:general",
    }),

    login: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "shopease:login",
    }),

    register: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "shopease:register",
    }),

    checkout: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "shopease:checkout",
    }),

    emailVerification: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(10, "10 m"),
        prefix: "shopease:email-verification",
    }),

    contact: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(3, "10 m"),
        prefix: "shopease:contact",
    }),

    upload: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "shopease:upload",
    }),

    cartMutation: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "shopease:cart-mutation",
    }),

    wishlistMutation: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "shopease:wishlist-mutation",
    }),

    adminRead: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "shopease:admin-read",
    }),

    logout: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "shopease:logout",
    }),

    adminMutation: createLimiter({
        timeout: 1500,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "shopease:admin-mutation",
    }),
};
