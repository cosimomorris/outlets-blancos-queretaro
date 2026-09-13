# Mercado Pago go-live checklist

## Follow-up: shipping and email (2026-09-13)

The owner requested shipping details and email notifications for both owner and customer, using `outletblancosqro@gmail.com` for sending and the owner's copy. Local changes add address collection/validation, address metadata and order storage, and Gmail SMTP notifications after verified payment approval. Commit `f0faaa5` was published in production by Netlify deploy `6aa6f6353d9e9500088aa513` on 2026-09-13. The live API rejects delivery without an address (400 `bad_shipping`) and unsigned webhooks (401 `bad_signature`). The earlier no-email decision below records the initial release.

- [x] Add required address fields for arranged delivery; pickup does not require an address. Shipping remains separately quoted and excluded from the payment.
- [x] Implement separate customer and owner email sends, with per-recipient status, concurrent-send locks and retry handling.
- [x] Local build and function bundling pass. Brave POTV checkout checks confirm pickup without address, delivery blocked without address, and payment enabled only with a valid 5-digit postal code and completed required address fields. These checks do not verify the deployed payment or email integration.
- [x] Configure `ORDER_EMAIL_APP_PASSWORD` as a Netlify secret in Production only, with the plan’s available Builds, Functions and Runtime scopes. Gmail SMTP authentication verified directly without sending email. Saved through Brave Local Dev at the user’s explicit request.
- [ ] For sandbox email verification, set `ORDER_EMAIL_TEST_TO` to a controlled inbox; both copies are redirected there.
- [x] Deploy shipping fields and email code to production. Netlify built the frontend and both functions successfully.
- [ ] Verify the full address survives Mercado Pago payment metadata into Netlify Blobs after an approved payment.
- [ ] Complete an authorized purchase and verify both email copies arrive with correct items, totals, and delivery information. Verify webhook replay does not resend a copy marked sent.


Status as of 2026-09-13: published on Netlify with real Mercado Pago credentials at the user’s explicit request to go straight to production. Live checkout creation and browser redirect work. Completed payments, order persistence, and refunds remain unverified.

Deployment discovery on 2026-09-13:
- The existing public site is `https://outletblancosqro.com`, served by Netlify (verified from the live HTTP response headers).
- Decision: keep Netlify, as requested by the user. Existing project: `outletqro`, team `cosimomorris`, account `morriscosimo@gmail.com`, site ID `8b531e7d-4a84-41b5-a93d-ed5c9459ddbe`. The prior deployment was a manual Netlify Drop upload, published February 8, 2026.
- Use Brave's `Local Dev` profile for this task, as explicitly requested by the user.
- Production build and `git diff --check` pass. Production deploy `6aa6f00c1250a05970bc6f94` published commit `8f63478`. Auto publishing from main is enabled.
- Live API creates Mercado Pago checkout successfully (HTTP 200). The browser reached the real payment-method selection page for a $99 MXN Fundas order. No charge was submitted. Unsigned webhook POST returns HTTP 401 `bad_signature`.
- Test-seller checkout returned HTTP 502 `mp_error`; the user then directed us to go straight to production. Sandbox purchase cases were not completed.

Already true:
- [x] Cart, checkout form, redirect to Mercado Pago, and return handling built (`src/App.vue`).
- [x] `api/create-preference.js` and `api/mp-webhook.js` implemented. The previous Vercel version had a reported local harness run; that does not verify the adapted Netlify handlers or live integration.
- [x] Production build passes.
- [x] A Mercado Pago account exists and is logged in as "Outlet Blancos Queretaro" in Brave (uses the business Gmail).

## 1. Mercado Pago developer panel

Log in with the Outlet Blancos account, then go to <https://www.mercadopago.com.mx/developers/panel/app>.

- [x] **Create application.** `Outlet Blancos Tienda`, application ID `3680872779809361`, Checkout Pro / Preferences API. Created successfully after retrying a temporary Mercado Pago error. The panel labels Preferences as legacy; the reference says existing integrations remain supported.
- [x] **Production credentials.** Phone verification completed; production Access Token is accessible. Store it only in Netlify secret environment variables, never in Git. Netlify Production now uses the real token; other contexts retain the test seller token.
- [x] **Webhook.** App → *Webhooks* → *Configurar notificaciones* → mode **Producción** → URL `https://outletblancosqro.com/api/mp-webhook` → event **Pagos** → save. Copy the **clave secreta**. This is `MP_WEBHOOK_SECRET`.
- [x] **Test accounts.** The application contains a México test seller (`3687529346`) and buyer (`3687529348`). Retrieve their login details from *Cuentas de prueba*; do not commit credentials.
- [x] **Test credentials.** Activated through this application’s *Credenciales de prueba* page. Test seller token and webhook secret saved as Netlify secret variables. The temporary Production test token was replaced with the real token before publishing.
- [ ] **Identity verification.** If the account has not been verified (INE, RFC, CURP), do it now. Production payments will not be enabled without it.
- [ ] **Bank account.** In the Mercado Pago app add the business CLABE so sales can be withdrawn.

## 2. Order records (no Resend)

- [x] Remove Resend, as requested by the user. No Resend account was created. Custom order emails are omitted.
- [x] Save approved orders in Netlify Blobs: `orders` for real payments, `orders-test` for test payments. Each payment ID is written once, so webhook retries do not duplicate orders.
- [ ] Verify a real test payment creates a record with products, delivery choice, buyer data, amount, and payment ID. View records in Netlify → outletqro → Blobs.

## 3. Netlify deployment

- [x] Commit the storefront, payment handlers, and Netlify configuration. Commit `8f63478` pushed to main. Local environment files and unrelated scratch files are excluded.
- [x] Connect `cosimomorris/outlets-blancos-queretaro` to the existing `outletqro` project. Do not create a duplicate site.
- [x] Configure `netlify.toml`: build `npm run build`, publish `dist`, functions `api`, Node 22, esbuild. Both handlers export their existing `/api/...` route.
- [x] Add environment variables (Project configuration → Environment variables; scope includes Functions). Tokens and webhook secrets are marked as secret values. `SITE_URL` is set only in Production:

  | Variable | Production | Deploy Previews / Development |
  | --- | --- | --- |
  | `MP_ACCESS_TOKEN` | real Access Token | test seller Access Token |
  | `MP_WEBHOOK_SECRET` | real webhook secret | test seller webhook secret |
  | `SITE_URL` | `https://outletblancosqro.com` | leave unset (falls back to the deployment URL) |

- [x] Publish production at the user’s explicit request to skip remaining sandbox tests. Production `SITE_URL` and webhook use `https://outletblancosqro.com`. The previous deploy `6988c8d37514a9414ead8c34` remains available in deploy history; auto publishing is enabled.
- [x] Verify the test deployment webhook is publicly reachable. Both deployed API routes respond over HTTPS (GET → 405, Allow: POST). Mercado Pago delivery and signature verification remain unverified. The existing Netlify project had no access protection when inspected on 2026-09-13.
- [x] Existing custom domain: `outletblancosqro.com`, served over HTTPS.

## 4. Test purchase (before real credentials)

Remaining sandbox tests were deferred by the user’s instruction to go straight to production. Use Deploy Preview #1 with test credentials if resuming them; do not replace live credentials with test credentials.

- [ ] Open the site, add two products, continue, fill name / email / WhatsApp, click **Pagar con Mercado Pago**.
- [ ] On the Mercado Pago page, log in as the test *Comprador* (incognito). Pay with Visa `4075 5957 1648 3764`, CVV `123`, expiry `11/30`, cardholder name `APRO`.
- [ ] Confirm the site returns to the "¡Gracias por tu compra!" screen and the cart is empty.
- [ ] Confirm the order record appears in Netlify Blobs `orders-test` with products, delivery choice, buyer data and payment ID.
- [ ] Repeat with cardholder `OTHE`: expect the failure notice and the cart kept.
- [ ] Repeat with cardholder `CONT` or pay with OXXO: expect the pending notice.
- [ ] Check Netlify → Functions → Logs for the webhook responses (200 on success, 401 on bad signature).

## 5. Go live

- [x] Swap Production env vars to the real Access Token and real webhook secret. Redeploy.
- [ ] Make one small real purchase, confirm the saved order, then refund it from the Mercado Pago dashboard (*Actividad* → payment → *Reembolsar*).
- [x] Remove the test-seller Access Token from Production. Test credentials remain only in non-production contexts.

## 6. Housekeeping

- [x] Replace the guessed URL in `.env.example` with the real domain: `https://outletblancosqro.com`.
- [x] Review `git diff` on `src/components/CatalogoSection.vue` and `src/style.css` before committing. The changes implement the catalog, product dialogs, cart/checkout styles, and responsive layout; no merge markers or unexpected external resource references found. Build and whitespace checks pass.
- [x] Order storage: Netlify Blobs plus the Mercado Pago payment dashboard. No additional database account or email service is needed. Verify persistence through an actual test payment before go-live.

## Where things are

- Payment flow: `src/App.vue` (`pay()` and the `onMounted` return handler).
- Server: `api/create-preference.js`, `api/mp-webhook.js`.
- Products and prices: `src/catalog.js`.
- Setup notes in Spanish: `README.md`.
