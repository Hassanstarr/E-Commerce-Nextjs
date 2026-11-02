import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "tests/**/*",
    "!tests/order-status.test.ts",
    "!tests/order-status.integration.test.ts",
    "!tests/seo.test.ts",
    "!tests/stripe-checkout-client.test.ts",
    "!tests/qa.test.ts",
    "!tests/qa.integration.test.ts",
    "scripts/**/*",
    "!scripts/stripe-listen.mjs",
    "!scripts/subscriptions.ts",
    "!scripts/notifications.ts",
    "project-notes/**",
    ".qa-*.json",
  ]),
]);

export default eslintConfig;
