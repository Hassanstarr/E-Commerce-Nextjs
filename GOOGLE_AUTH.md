# Google sign-in

Google sign-in is available on the login and signup pages. New Google users get a customer account, and existing Google users sign into the same account. Existing password accounts with a matching Gmail or Google Workspace email can also sign in through Google. Their password, role, orders, and checkout email verification remain intact.

For a matching existing account with a third-party email that Google does not host, the user must keep using the original login method. Google verification alone is not sufficient to link that email safely. Accounts are subsequently identified by Google's stable subject ID, not by a changing email address.

## Configuration

1. Use a **Web application** OAuth client in Google Cloud Console.
2. Add these **Authorized JavaScript origins** to that client:
   - `http://localhost`
   - `http://localhost:3000`
   - Your exact deployed HTTPS origin, such as `https://your-project.vercel.app`.
   - Your custom domain origin if you use one.
3. Configure the app's branding and audience. If Google restricts your app to test users, add the accounts you will test with.
4. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local` and in the Vercel environments where Google sign-in should work. Restart local development and rebuild/redeploy after changing this public variable.

This uses Google's popup credential callback, so an OAuth redirect URI and a Google client secret are not required. Your existing `MONGODB_URI`, `JWT_SECRET`, and Upstash rate-limit configuration are also used.

The backend verifies Google's signature, issuer, audience, expiry, verified email, and a nonce tied to the current browser before issuing the existing HTTP-only session cookie. Both Google endpoints are rate limited. Google credentials are not stored in the browser or database.

## Verification

Run `node --test tests/google-auth.test.mjs` for token verification, account linking, role preservation, and session protection tests. A complete Google popup test requires an authorized Google origin and a real Google account.

References: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid and https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
