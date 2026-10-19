import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

function load(file, mocks, env = {}) {
    const compiledModule = { exports: {} };
    const source = ts.transpileModule(readFileSync(file, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    vm.runInNewContext(source, {
        module: compiledModule,
        exports: compiledModule.exports,
        require: (name) => name in mocks ? mocks[name] : require(name),
        process: { env },
        console: { error() {} },
        TextEncoder,
    });
    return compiledModule.exports;
}

const AppError = load("lib/AppError.ts", {}).default;
const clone = (value) => value == null ? value : structuredClone(value);

function fixture() {
    let user = { _id: "user-1", email: "user@example.com", password: "old-hash" };
    const mail = [];
    let mailFails = false;
    let hashCalls = 0;
    const get = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
    const matches = (filter) => user && Object.entries(filter).every(([key, expected]) => {
        if (key === "$or") return expected.some(matches);
        const actual = get(user, key);
        if (expected && typeof expected === "object" && !(expected instanceof Date)) {
            return Object.entries(expected).every(([operator, value]) => {
                if (operator === "$exists") return (actual !== undefined) === value;
                if (operator === "$gt") return actual > value;
                if (operator === "$lt") return actual < value;
                if (operator === "$lte") return actual <= value;
                throw new Error(`Unsupported operator ${operator}`);
            });
        }
        return actual === expected;
    });
    const set = (path, value, remove = false) => {
        const keys = path.split(".");
        const leaf = keys.pop();
        let parent = user;
        for (const key of keys) parent = parent[key] ||= {};
        if (remove) delete parent[leaf];
        else parent[leaf] = value;
    };
    const update = (changes) => {
        for (const [path, value] of Object.entries(changes.$set || {})) set(path, clone(value));
        for (const [path, value] of Object.entries(changes.$inc || {})) set(path, (get(user, path) || 0) + value);
        for (const path of Object.keys(changes.$unset || {})) set(path, null, true);
    };
    const User = {
        findOneAndUpdate(filter, changes, options) {
            const before = matches(filter) ? clone(user) : null;
            if (before) update(changes);
            const result = options?.new && before ? clone(user) : before;
            return { select: async () => result, then: (resolve, reject) => Promise.resolve(result).then(resolve, reject) };
        },
        async updateOne(filter, changes) {
            if (!matches(filter)) return { modifiedCount: 0 };
            update(changes);
            return { modifiedCount: 1 };
        },
        async exists(filter) { return matches(filter) ? { _id: user._id } : null; },
    };
    const service = load("services/password-reset.service.ts", {
        "@/models/User": { default: User },
        "@/lib/AppError": { default: AppError },
        bcryptjs: { default: { async hash(value, cost) { hashCalls++; assert.equal(cost, 12); return `hashed:${value}`; } } },
        nodemailer: { default: { createTransport: () => ({ async sendMail(message) {
            if (mailFails) throw new Error("SMTP unavailable");
            mail.push(message);
        } }) } },
    }, { EMAIL_USER: "sender@example.com", EMAIL_PASSWORD: "test-only", JWT_SECRET: "test-only-secret" });
    return {
        service, mail,
        get user() { return user; },
        get hashCalls() { return hashCalls; },
        setUser(value) { user = value; },
        failMail() { mailFails = true; },
        code() { return mail.at(-1).text.match(/code is (\d{6})/)[1]; },
    };
}

test("reset needs a verified code, hashes the password, consumes the token and revokes sessions", async () => {
    const f = fixture();
    await f.service.requestPasswordReset(f.user.email);
    assert.match(f.code(), /^\d{6}$/);
    assert.notEqual(f.user.passwordReset.otpHash, f.code());
    assert.equal(f.user.password, "old-hash");
    const { token } = await f.service.verifyPasswordReset(f.user.email, f.code());
    assert.match(token, /^[a-f0-9]{64}$/);
    assert.notEqual(f.user.passwordReset.tokenHash, token);
    assert.equal(f.user.passwordReset.otpHash, undefined);
    await assert.rejects(f.service.verifyPasswordReset(f.user.email, f.code()), /Invalid or expired/);
    await f.service.resetPassword(f.user.email, token, "new-password");
    assert.equal(f.user.password, "hashed:new-password");
    assert.equal(f.user.sessionVersion, 1);
    assert.equal(f.user.passwordReset, undefined);
    await assert.rejects(f.service.resetPassword(f.user.email, token, "replay"), /expired/);
});

test("unknown email and cooldown requests do not send extra messages", async () => {
    const f = fixture();
    await f.service.requestPasswordReset("unknown@example.com");
    assert.equal(f.mail.length, 0);
    await f.service.requestPasswordReset(f.user.email);
    const firstHash = f.user.passwordReset.otpHash;
    await f.service.requestPasswordReset(f.user.email);
    assert.equal(f.mail.length, 1);
    assert.equal(f.user.passwordReset.otpHash, firstHash);
});

test("five wrong guesses lock the code, including a later correct guess", async () => {
    const f = fixture();
    await f.service.requestPasswordReset(f.user.email);
    for (let i = 0; i < 5; i++) {
        await assert.rejects(f.service.verifyPasswordReset(f.user.email, "000000"), /Invalid or expired/);
    }
    await assert.rejects(f.service.verifyPasswordReset(f.user.email, f.code()), /Invalid or expired/);
    assert.equal(f.user.passwordReset.attempts, 5);
    assert.equal(f.user.passwordReset.tokenHash, undefined);
});

test("expired codes and reset tokens cannot change the password", async () => {
    const f = fixture();
    await f.service.requestPasswordReset(f.user.email);
    f.user.passwordReset.expiresAt = new Date(0);
    await assert.rejects(f.service.verifyPasswordReset(f.user.email, f.code()), /Invalid or expired/);
    f.user.passwordReset.sentAt = new Date(0);
    await f.service.requestPasswordReset(f.user.email);
    const { token } = await f.service.verifyPasswordReset(f.user.email, f.code());
    f.user.passwordReset.expiresAt = new Date(0);
    await assert.rejects(f.service.resetPassword(f.user.email, token, "new-password"), /expired/);
    assert.equal(f.hashCalls, 0);
    assert.equal(f.user.password, "old-hash");
});

test("a resend replaces the earlier challenge and verification belongs to one email", async () => {
    const f = fixture();
    await f.service.requestPasswordReset(f.user.email);
    const { token } = await f.service.verifyPasswordReset(f.user.email, f.code());
    await assert.rejects(f.service.resetPassword("another@example.com", token, "new-password"), /expired/);
    f.user.passwordReset.sentAt = new Date(0);
    await f.service.requestPasswordReset(f.user.email);
    assert.equal(f.mail.length, 2);
    await assert.rejects(f.service.resetPassword(f.user.email, token, "new-password"), /expired/);
});

test("concurrent verification and reset requests only succeed once", async () => {
    const f = fixture();
    await f.service.requestPasswordReset(f.user.email);
    const verified = await Promise.allSettled([
        f.service.verifyPasswordReset(f.user.email, f.code()),
        f.service.verifyPasswordReset(f.user.email, f.code()),
    ]);
    assert.equal(verified.filter((result) => result.status === "fulfilled").length, 1);
    const { token } = verified.find((result) => result.status === "fulfilled").value;
    const reset = await Promise.allSettled([
        f.service.resetPassword(f.user.email, token, "new-password"),
        f.service.resetPassword(f.user.email, token, "another-password"),
    ]);
    assert.equal(reset.filter((result) => result.status === "fulfilled").length, 1);
    assert.equal(f.user.sessionVersion, 1);
});

test("failed mail delivery clears its challenge and reports a retryable error", async () => {
    const f = fixture();
    f.failMail();
    await assert.rejects(f.service.requestPasswordReset(f.user.email), /Unable to send/);
    assert.equal(f.user.passwordReset, undefined);
    assert.equal(f.user.password, "old-hash");
});

test("reset validation rejects malformed codes, weak passwords and mismatched passwords", () => {
    const schemas = load("lib/validations.ts", {});
    assert.equal(schemas.forgotPasswordSchema.parse({ email: " USER@EXAMPLE.COM " }).email, "user@example.com");
    assert.equal(schemas.verifyPasswordResetSchema.safeParse({ email: "user@example.com", otp: "abcdef" }).success, false);
    const data = { email: "user@example.com", token: "a".repeat(64), password: "new-password", confirmPassword: "new-password" };
    assert.equal(schemas.resetPasswordSchema.safeParse(data).success, true);
    assert.equal(schemas.resetPasswordSchema.safeParse({ ...data, password: "      ", confirmPassword: "      " }).success, false);
    assert.equal(schemas.resetPasswordSchema.safeParse({ ...data, confirmPassword: "different" }).success, false);
});

test("authentication accepts existing sessions and rejects sessions revoked by a reset", async () => {
    let version = 0;
    const auth = load("middleware/auth.ts", {
        "next/headers": { cookies: async () => ({ get: () => ({ value: "test-token" }) }) },
        "@/lib/auth": { verifyToken: async () => ({ userId: "user-1", role: "user", sessionVersion: 0 }) },
        "@/lib/AppError": { default: AppError },
        "@/lib/db": { connectDB: async () => {} },
        "@/models/User": { default: { findById: () => ({ select: async () => ({ sessionVersion: version }) }) } },
    });
    assert.equal((await auth.requireAuth()).userId, "user-1");
    version = 1;
    await assert.rejects(auth.requireAuth(), /session has expired/);
});

test("signed sessions carry the version and existing tokens remain compatible", async () => {
    const jose = await import("jose");
    const secret = "test-only-secret";
    const auth = load("lib/auth.ts", { jose }, { JWT_SECRET: secret });
    const current = await auth.createToken("user-1", "user", 2);
    assert.equal((await auth.verifyToken(current)).sessionVersion, 2);
    const legacy = await new jose.SignJWT({ userId: "user-1", role: "user" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt().setExpirationTime("1m").sign(new TextEncoder().encode(secret));
    assert.equal((await auth.verifyToken(legacy)).sessionVersion, 0);
    assert.equal(await auth.verifyToken("invalid-token"), null);
});

test("controller validates origin and inputs, returning reset credentials only after verification", async () => {
    const calls = [];
    const { NextRequest } = require("next/server");
    const controller = load("controllers/password-reset.controller.ts", {
        "@/lib/validations": load("lib/validations.ts", {}),
        "@/services/password-reset.service": {
            requestPasswordReset: async (...args) => calls.push(["request", ...args]),
            verifyPasswordReset: async (...args) => { calls.push(["verify", ...args]); return { token: "b".repeat(64) }; },
            resetPassword: async (...args) => calls.push(["reset", ...args]),
        },
        "@/lib/db": { connectDB: async () => {} },
        "@/lib/apiResponse": load("lib/apiResponse.ts", {}),
        "@/lib/apiError": load("lib/apiError.ts", {}),
        "@/lib/AppError": { default: AppError },
    });
    const request = (body, origin = "http://localhost:3000") => new NextRequest("http://localhost:3000/api/auth/forgot-password", {
        method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body),
    });
    assert.equal((await controller.passwordResetController(request({ email: "user@example.com" }, "https://other.example"), "request")).status, 403);
    assert.equal((await controller.passwordResetController(request({ email: "bad-email" }), "request")).status, 400);
    assert.equal(calls.length, 0);
    const sent = await controller.passwordResetController(request({ email: " USER@EXAMPLE.COM " }), "request");
    assert.equal(sent.status, 200);
    assert.match((await sent.json()).message, /If an account exists/);
    assert.equal(sent.headers.get("cache-control"), "private, no-store");
    assert.equal(calls[0][1], "user@example.com");
    const verified = await controller.passwordResetController(request({ email: "user@example.com", otp: "123456" }), "verify");
    assert.equal((await verified.json()).data.token, "b".repeat(64));
    const reset = await controller.passwordResetController(request({ email: "user@example.com", token: "b".repeat(64), password: "new-password", confirmPassword: "new-password" }), "reset");
    assert.equal(reset.status, 200);
    assert.match(reset.headers.get("set-cookie"), /auth_token=;/);
    assert.equal(calls[2][0], "reset");
});

test("all reset endpoints enforce rate limits before running the controller", async () => {
    for (const [path, action] of [["forgot-password", "request"], ["verify-reset-code", "verify"], ["reset-password", "reset"]]) {
        let blocked = true;
        let called = 0;
        const response = { status: 429 };
        const route = load(`app/api/auth/${path}/route.ts`, {
            "@/controllers/password-reset.controller": { passwordResetController: async (_, value) => { called++; assert.equal(value, action); return { status: 200 }; } },
            "@/lib/enforce-rate-limit": { enforceRateLimit: async (_, limiter) => { assert.equal(limiter, action === "request" ? "send-limit" : "reset-limit"); return blocked ? response : null; } },
            "@/lib/rate-limit": { rateLimiters: { passwordResetRequest: "send-limit", passwordReset: "reset-limit" } },
        });
        assert.equal(await route.POST({}), response);
        assert.equal(called, 0);
        blocked = false;
        assert.equal((await route.POST({})).status, 200);
        assert.equal(called, 1);
    }
});
