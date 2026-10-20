
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();


export const rateLimiters = {
    accountUpdate: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        prefix: "shopease:account-update",
    }),

    passwordChange: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "shopease:password-change",
    }),

    passwordResetRequest: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "shopease:password-reset-request",
    }),

    passwordReset: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "10 m"),
        prefix: "shopease:password-reset",
    }),
    general: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        prefix: "shopease:general",
    }),

    login: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "shopease:login",
    }),

    register: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "shopease:register",
    }),

    checkout: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "shopease:checkout",
    }),

    emailVerification: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "10 m"),
        prefix: "shopease:email-verification",
    }),

    contact: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "10 m"),
        prefix: "shopease:contact",
    }),

    upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "shopease:upload",
    }),

    cartMutation: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "shopease:cart-mutation",
    }),

    wishlistMutation: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "shopease:wishlist-mutation",
    }),

    adminRead: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "shopease:admin-read",
    }),

    logout: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "shopease:logout",
    }),

    adminMutation: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "shopease:admin-mutation",
    }),
};
