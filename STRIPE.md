# Stripe payments

Checkout offers Cash on Delivery and Stripe's hosted card checkout. All amounts are in PKR and include the existing Rs. 200 delivery fee. COD orders start with pending payment. Stripe orders are created with paid payment status only after Stripe confirms success.

## Environment

Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL` in Vercel. The app URL must be the deployed HTTPS origin. Hosted Checkout does not require a browser publishable key.

Configure the Stripe webhook endpoint as `https://YOUR_DOMAIN/api/stripe/webhook` and subscribe to:

- `payment_intent.succeeded`
- `payment_intent.canceled` (one “l”)
- `payment_intent.payment_failed`

Use matching test or live keys and webhook endpoints. Keep secrets out of Git.

## Local testing

1. Use a Stripe test secret key in `.env.local` and set `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
2. Install the official CLI with `npm install -g --allow-scripts=@stripe/cli @stripe/cli`.
3. Run `stripe login` and approve the browser prompt. Recent CLI versions may also require `stripe login --complete-device`.
4. Run `npm run stripe:listen`. This runs the requested listener, uses the configured test secret key when available, and writes its own signing secret into `.env.local` without printing it. The CLI signing secret is different from the Vercel/Dashboard endpoint secret.
5. Start or restart the app with `npm run dev` on port 3000. Keep the listener running.
6. Sign in, add products, verify the checkout email, select Stripe, and pay with test card `4242 4242 4242 4242`, a future expiry, and any CVC. Use `4000 0025 0000 3155` for authentication and `4000 0000 0000 9995` for a decline.
7. Verify that a successful Stripe order is paid, a COD order is pending, and declined/canceled attempts leave the cart and stock unchanged. Resending a success event must not create a second order or reduce stock again.

Direct CLI equivalent:

```text
stripe listen --events payment_intent.succeeded,payment_intent.canceled,payment_intent.payment_failed --forward-to localhost:3000/api/stripe/webhook
```

Only use test cards in Stripe test mode. The return page checks payment server-side and waits for the paid order. Closing the browser does not prevent the signed webhook from completing the order. If a product becomes unavailable between opening Stripe and payment, fulfillment rolls back and the payment is refunded with an idempotent refund request.

MongoDB must support transactions, as it already does for COD checkout. Restart the app after schema changes so the Stripe Checkout and unique payment-intent indexes can initialize.

References: https://docs.stripe.com/checkout/quickstart, https://docs.stripe.com/webhooks, https://docs.stripe.com/testing
