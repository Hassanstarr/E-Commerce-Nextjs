# Email subscriptions

Open **Subscription** from the profile dropdown. The registered email is read-only. Every option is off until the customer saves their choices:

- Wishlist restock: a product changes from zero stock to positive stock and is still on the customer's wishlist when the email is prepared. Stock returned by an admin cancelling an order is included.
- Discounts: new discounts on available products, across all categories or only selected categories. Ended offers and deleted products are excluded.
- Cart reminders: one reminder after two days without changes to a non-empty cart with available products. Checkout clears purchased items, so an empty cart does not receive reminders. Changing the cart can qualify it for another reminder after two days.

Matching updates are combined into one daily digest, showing up to 20 recent product updates. Saving changed preferences starts product alerts from that point onward. Existing offers are not sent retroactively. Order confirmations, verification emails, and password resets are unaffected.

Every subscription email links to `/subscription`. A signed-out customer is sent to login and returned to this page after password or Google sign-in. They can uncheck individual options or use **Uncheck all**, then **Save**. **Cancel** restores the last saved choices without changing the database.

## Deployment

Existing `EMAIL_USER` and `EMAIL_PASSWORD` send the emails. Set `NEXT_PUBLIC_APP_URL` to the public HTTPS production website so product and unsubscribe links use the correct domain.

Add a private `CRON_SECRET` environment variable with a random value of at least 32 characters in Vercel. To test the protected cron HTTP endpoint locally, also add this value in `.env.local`; the local commands below do not require it. Do not add a public prefix. The example environment file contains a placeholder only; replace it with your own value.

`vercel.json` schedules `/api/cron/subscriptions` every day at 05:00 UTC (10:00 Pakistan time). Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically. Redeploy after adding the environment settings. The daily schedule works with Vercel Hobby; the exact execution time may vary. See [Vercel's cron documentation](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

The scheduler is independent of browser visits. Local `npm run dev` does not schedule cron jobs. To test locally, make a GET request to `http://localhost:3000/api/cron/subscriptions` with the same Authorization header. Use a test customer who has opted in, then change a product from zero stock to positive stock or start a new discount. Do not share the secret or put it in a query string.

For simpler local testing, run `npm run subscriptions:check` to count eligible emails without sending or changing preferences. Then run `npm run subscriptions:send` to process pending subscription emails immediately. These commands load `.env.local` themselves and do not require the website to be running or a `CRON_SECRET`, because they call the worker locally rather than exposing an HTTP endpoint. The send command emails all eligible opted-in accounts, so use a development database with test accounts. The existing once-per-day limit still applies; repeated commands do not force duplicate emails.

Subscribe and save **before** starting a new discount. The product must be in stock and the discount must still be active. Selecting all categories does not send existing discounts retroactively. If the check reports zero eligible emails, confirm these conditions first. On Vercel, alerts are sent by the daily scheduler rather than immediately when a product is edited.

Events are stored in MongoDB alongside successful inventory/discount transactions. The daily worker reads current preferences and product availability before preparing each digest. A unique daily delivery claim prevents concurrent runs from sending the same digest twice, and failed mail attempts leave the updates available for retry. A mail server accepting a message does not guarantee inbox delivery; an interruption immediately after SMTP acceptance can still cause a retry, because SMTP and MongoDB cannot share a transaction.

The worker processes the oldest unchecked subscriptions for up to four minutes per invocation, within the route's five-minute limit. Events and delivery records expire after 30 days. For a larger mailing list, use a dedicated email provider and a more frequent queue worker rather than increasing Gmail traffic.

## Verification

Run `node --import tsx --test tests/subscription.integration.test.ts`. The integration tests create a randomly named, isolated database, mock all outgoing email, and remove only that test database afterward. They never send real customer emails or change the application's database.
