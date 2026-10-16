import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { createLocalJWKSet, exportJWK, generateKeyPair, jwtVerify, SignJWT } from "jose";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const clientId = "test-client.apps.googleusercontent.com";
const nonce = "n".repeat(43);

class AppError extends Error {
    constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

function load(file, mocks, env = {}) {
    const source = ts.transpileModule(readFileSync(file, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    }).outputText;
    const loaded = { exports: {} };
    vm.runInNewContext(source, {
        module: loaded,
        exports: loaded.exports,
        require: (name) => name in mocks ? mocks[name] : require(name),
        URL,
        process: { env: { NEXT_PUBLIC_GOOGLE_CLIENT_ID: clientId, ...env } },
        console: { error() {} },
    }, { filename: file });
    return loaded.exports;
}

const { publicKey, privateKey } = await generateKeyPair("RS256");
const keySet = createLocalJWKSet({ keys: [{ ...await exportJWK(publicKey), kid: "test", alg: "RS256" }] });
const { verifyGoogleCredential } = load("lib/google-auth.ts", {
    jose: { createRemoteJWKSet: () => keySet, jwtVerify },
    "@/lib/AppError": AppError,
});

function token(overrides = {}, signingKey = privateKey) {
    return new SignJWT({
        sub: "google-subject",
        email: "Customer@gmail.com",
        email_verified: true,
        name: "Customer",
        nonce,
        ...overrides,
    }).setProtectedHeader({ alg: "RS256", kid: "test" })
        .setIssuer(overrides.iss ?? "https://accounts.google.com")
        .setAudience(overrides.aud ?? clientId)
        .setIssuedAt()
        .setExpirationTime(overrides.exp ?? "1h")
        .sign(signingKey);
}

test("verifies a signed Google token and normalizes its identity", async () => {
    const profile = await verifyGoogleCredential(await token(), nonce);
    assert.equal(profile.googleId, "google-subject");
    assert.equal(profile.email, "customer@gmail.com");
    assert.equal(profile.authoritativeEmail, true);
});

test("rejects wrong audience, issuer, expiry, nonce, unverified email, and authorized party", async () => {
    for (const overrides of [
        { aud: "another-client" }, { iss: "https://attacker.test" },
        { exp: 1 }, { nonce: "another-browser" }, { email_verified: false },
        { azp: "another-client" }, { sub: "" },
    ]) {
        await assert.rejects(verifyGoogleCredential(await token(overrides), nonce), (error) => error.statusCode === 401);
    }
});

test("rejects tokens signed by another key and malformed credentials", async () => {
    const attacker = await generateKeyPair("RS256");
    await assert.rejects(verifyGoogleCredential(await token({}, attacker.privateKey), nonce), (error) => error.statusCode === 401);
    await assert.rejects(verifyGoogleCredential("not-a-token", nonce), (error) => error.statusCode === 401);
});

test("distinguishes Google's hosted emails from third-party addresses", async () => {
    assert.equal((await verifyGoogleCredential(await token({ email: "person@other.test" }), nonce)).authoritativeEmail, false);
    assert.equal((await verifyGoogleCredential(await token({ email: "person@company.test", hd: "company.test" }), nonce)).authoritativeEmail, true);
});

function serviceFixture(records = [], profileOverrides = {}) {
    const users = records.map((record) => ({ ...record }));
    const logs = [];
    const profile = { googleId: "google-subject", email: "customer@gmail.com", name: "Customer", authoritativeEmail: true, ...profileOverrides };
    const User = {
        async findOne(filter) {
            return users.find((user) => Object.entries(filter).every(([key, value]) => user[key] === value)) || null;
        },
        async findOneAndUpdate(filter, update) {
            const user = users.find((user) => user._id === filter._id && !user.googleId);
            if (!user) return null;
            assert.equal(filter.googleId.$exists, false);
            Object.assign(user, update.$set);
            return user;
        },
        async create(data) { const user = { _id: "new-user", ...data }; users.push(user); return user; },
    };
    const service = load("services/google-auth.service.ts", {
        "@/models/User": User,
        "@/lib/AppError": AppError,
        "@/lib/google-auth": { verifyGoogleCredential: async () => profile },
        "./activity.service": { createActivityLog: async (log) => logs.push(log) },
    });
    return { ...service, users, logs };
}

test("a first Google login creates a customer without a password or checkout verification", async () => {
    const fixture = serviceFixture();
    const result = await fixture.loginGoogleUser("credential", nonce);
    assert.equal(result.role, "user");
    assert.equal(fixture.users.length, 1);
    assert.equal(fixture.users[0].googleId, "google-subject");
    assert.equal(fixture.users[0].password, undefined);
    assert.equal(fixture.users[0].verifiedCheckoutEmails, undefined);
    assert.equal(fixture.logs.length, 1);
    assert.equal("googleId" in result, false);
});

test("Google links a matching Gmail account while preserving its ID, password, role, and checkout state", async () => {
    const fixture = serviceFixture([{ _id: "existing", name: "Admin", email: "customer@gmail.com", password: "hashed", role: "admin", verifiedCheckoutEmails: ["delivery@test.com"] }]);
    const result = await fixture.loginGoogleUser("credential", nonce);
    assert.equal(result.id, "existing");
    assert.equal(result.role, "admin");
    assert.equal(fixture.users.length, 1);
    assert.equal(fixture.users[0].password, "hashed");
    assert.deepEqual(fixture.users[0].verifiedCheckoutEmails, ["delivery@test.com"]);
    assert.equal(fixture.logs.length, 0);
});

test("repeat sign-ins use the Google subject even if Google's email changes", async () => {
    const fixture = serviceFixture([{ _id: "existing", name: "Customer", email: "old@gmail.com", googleId: "google-subject", role: "user" }]);
    assert.equal((await fixture.loginGoogleUser("credential", nonce)).id, "existing");
    assert.equal(fixture.users.length, 1);
});

test("cannot link an existing third-party email or overwrite another Google identity", async () => {
    for (const [record, profile] of [
        [{ email: "customer@gmail.com" }, { authoritativeEmail: false }],
        [{ email: "customer@gmail.com", googleId: "other-subject" }, {}],
    ]) {
        const fixture = serviceFixture([{ _id: "existing", role: "user", ...record }], profile);
        await assert.rejects(fixture.loginGoogleUser("credential", nonce), (error) => error.statusCode === 409);
        assert.equal(fixture.users[0].googleId, record.googleId);
    }
});

function controllerFixture() {
    let logins = 0;
    const response = (data, message, status = 200) => ({
        data, message, status,
        headers: new Map(),
        cookies: { values: new Map(), set(name, value, options) { this.values.set(name, { value, ...options }); } },
    });
    const controller = load("controllers/google-auth.controller.ts", {
        "next/server": {},
        "@/services/google-auth.service": { loginGoogleUser: async () => { logins++; return { id: "existing", role: "admin" }; } },
        "@/lib/auth": { createToken: async () => "session-token" },
        "@/lib/apiResponse": { successResponse: response },
        "@/lib/apiError": { errorResponse: (message, status) => response(null, message, status) },
        "@/lib/AppError": AppError,
    }, { NODE_ENV: "production" });
    return { ...controller, getLogins: () => logins };
}

function request({ origin = "https://shop.test", cookie = nonce, body = { credential: "signed-token" } } = {}) {
    return {
        nextUrl: new URL("https://shop.test/api/auth/google"),
        headers: new Map([["origin", origin]]),
        cookies: { get: () => cookie ? { value: cookie } : undefined },
        json: async () => body,
    };
}

test("cross-origin, expired browser session, and invalid bodies cannot authenticate", async () => {
    const fixture = controllerFixture();
    assert.equal((await fixture.googleLoginController(request({ origin: "https://attacker.test" }))).status, 403);
    assert.equal((await fixture.googleLoginController(request({ cookie: "" }))).status, 401);
    assert.equal((await fixture.googleLoginController(request({ body: {} }))).status, 400);
    assert.equal(fixture.getLogins(), 0);
});

test("successful login issues the existing protected cookie, redirects by role, and clears the nonce", async () => {
    const fixture = controllerFixture();
    const result = await fixture.googleLoginController(request());
    assert.equal(result.data.redirectTo, "/admin");
    const cookie = result.cookies.values.get("auth_token");
    assert.equal(cookie.value, "session-token");
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, "lax");
    assert.equal(cookie.path, "/");
    assert.equal(result.cookies.values.get("google_auth_nonce").maxAge, 0);
    assert.equal(result.headers.get("Cache-Control"), "private, no-store");
});

test("nonce initialization is private, reusable across tabs, and HTTP-only", () => {
    const fixture = controllerFixture();
    const result = fixture.googleNonceController(request());
    assert.equal(result.data.nonce, nonce);
    assert.equal(result.cookies.values.get("google_auth_nonce").httpOnly, true);
    assert.equal(result.headers.get("Cache-Control"), "private, no-store");
});

test("the actual user schema requires a password for ordinary accounts and permits Google accounts without one", async () => {
    const User = load("models/User.ts", {}).default;
    const ordinary = new User({ name: "Customer", email: "customer@test.com" });
    await assert.rejects(ordinary.validate(), (error) => Boolean(error.errors.password));
    const google = new User({ name: "Customer", email: "customer@test.com", googleId: "google-subject" });
    await google.validate();
    assert.deepEqual(Array.from(google.verifiedCheckoutEmails), []);
    assert.ok(User.schema.indexes().some(([fields, options]) => fields.googleId === 1 && options.unique && options.sparse));
});

test("password login for a Google-only account returns 401 without trying to compare an absent password", async () => {
    let compared = false;
    const { loginUser } = load("services/auth.service.ts", {
        bcryptjs: { compare: async () => { compared = true; return false; } },
        "@/models/User": { findOne: async () => ({ googleId: "google-subject" }) },
        "@/lib/AppError": AppError,
        "./activity.service": {},
    });
    await assert.rejects(loginUser({ email: "customer@test.com", password: "password" }), (error) => error.statusCode === 401);
    assert.equal(compared, false);
});
