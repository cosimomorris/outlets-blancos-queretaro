# Mercado Pago go-live checklist

Status as of 2026-09-13. The storefront builds locally. Payment handlers have been adapted for Netlify; deployed payment and order-storage verification remains pending.

Deployment discovery on 2026-09-13:
- The existing public site is `https://outletblancosqro.com`, served by Netlify (verified from the live HTTP response headers).
- Decision: keep Netlify, as requested by the user. Existing project: `outletqro`, team `cosimomorris`, account `morriscosimo@gmail.com`, site ID `8b531e7d-4a84-41b5-a93d-ed5c9459ddbe`. The prior deployment was a manual Netlify Drop upload, published February 8, 2026.
- Use Brave's `Local Dev` profile for this task, as explicitly requested by the user.
- Production build and `git diff --check` pass. No end-to-end payment or order persistence has been verified in this session.

Already true:
- [x] Cart, checkout form, redirect to Mercado Pago, and return handling built (`src/App.vue`).
- [x] `api/create-preference.js` and `api/mp-webhook.js` implemented. The previous Vercel version had a reported local harness run; that does not verify the adapted Netlify handlers or live integration.
- [x] Production build passes.
- [x] A Mercado Pago account exists and is logged in as "Outlet Blancos Queretaro" in Brave (uses the business Gmail).

## 1. Mercado Pago developer panel

Log in with the Outlet Blancos account, then go to <https://www.mercadopago.com.mx/developers/panel/app>.

- [x] **Create application.** `Outlet Blancos Tienda`, application ID `3680872779809361`, Checkout Pro / Preferences API. Created successfully after retrying a temporary Mercado Pago error. The panel labels Preferences as legacy; the reference says existing integrations remain supported.
- [ ] **Production credentials.** Open the app → *Credenciales de producción*. If it asks to activate, complete the business info and accept the terms. Copy the **Access Token** (starts with `APP_USR-`). This is `MP_ACCESS_TOKEN` for Production.
- [ ] **Webhook.** App → *Webhooks* → *Configurar notificaciones* → mode **Producción** → URL `https://outletblancosqro.com/api/mp-webhook` → event **Pagos** → save. Copy the **clave secreta**. This is `MP_WEBHOOK_SECRET`.
- [x] **Test accounts.** The application contains a México test seller (`3687529346`) and buyer (`3687529348`). Retrieve their login details from *Cuentas de prueba*; do not commit credentials.
- [ ] **Test credentials.** In an incognito window log in as the test *Vendedor*, open its developer panel, create an application there, and copy its Access Token and webhook secret. Use those for Netlify Deploy Previews / development.
- [ ] **Identity verification.** If the account has not been verified (INE, RFC, CURP), do it now. Production payments will not be enabled without it.
- [ ] **Bank account.** In the Mercado Pago app add the business CLABE so sales can be withdrawn.

## 2. Order records (no Resend)

- [x] Remove Resend, as requested by the user. No Resend account was created. Custom order emails are omitted.
- [x] Save approved orders in Netlify Blobs: `orders` for real payments, `orders-test` for test payments. Each payment ID is written once, so webhook retries do not duplicate orders.
- [ ] Verify a real test payment creates a record with products, delivery choice, buyer data, amount, and payment ID. View records in Netlify → outletqro → Blobs.

## 3. Netlify deployment

- [ ] Commit the storefront, payment handlers, and Netlify configuration. Local environment files and unrelated scratch files are excluded.
- [ ] Connect `cosimomorris/outlets-blancos-queretaro` to the existing `outletqro` project. Do not create a duplicate site.
- [x] Configure `netlify.toml`: build `npm run build`, publish `dist`, functions `api`, Node 22, esbuild. Both handlers export their existing `/api/...` route.
- [ ] Add environment variables (Project configuration → Environment variables, Functions scope):

  | Variable | Production | Deploy Previews / Development |
  | --- | --- | --- |
  | `MP_ACCESS_TOKEN` | real Access Token | test seller Access Token |
  | `MP_WEBHOOK_SECRET` | real webhook secret | test seller webhook secret |
  | `SITE_URL` | `https://outletblancosqro.com` | leave unset (falls back to the deployment URL) |

- [ ] Deploy and validate using the deployment permalink before publishing. The existing production deploy `6988c8d37514a9414ead8c34` is locked while setup and tests are in progress; unlock and publish only after the checks pass. Production `SITE_URL` and the production webhook must use `https://outletblancosqro.com`.
- [ ] Verify the test deployment webhook is publicly reachable by Mercado Pago. The existing Netlify project had no access protection when inspected on 2026-09-13.
- [x] Existing custom domain: `outletblancosqro.com`, served over HTTPS.

## 4. Test purchase (before real credentials)

Use the test seller credentials in Production temporarily, or a preview with protection off.

- [ ] Open the site, add two products, continue, fill name / email / WhatsApp, click **Pagar con Mercado Pago**.
- [ ] On the Mercado Pago page, log in as the test *Comprador* (incognito). Pay with Visa `4075 5957 1648 3764`, CVV `123`, expiry `11/30`, cardholder name `APRO`.
- [ ] Confirm the site returns to the "¡Gracias por tu compra!" screen and the cart is empty.
- [ ] Confirm the order record appears in Netlify Blobs `orders-test` with products, delivery choice, buyer data and payment ID.
- [ ] Repeat with cardholder `OTHE`: expect the failure notice and the cart kept.
- [ ] Repeat with cardholder `CONT` or pay with OXXO: expect the pending notice.
- [ ] Check Netlify → Functions → Logs for the webhook responses (200 on success, 401 on bad signature).

## 5. Go live

- [ ] Swap Production env vars to the real Access Token and real webhook secret. Redeploy.
- [ ] Make one small real purchase, confirm the saved order, then refund it from the Mercado Pago dashboard (*Actividad* → payment → *Reembolsar*).
- [ ] Remove the test-seller credentials from Production if they were used there.

## 6. Housekeeping

- [x] Replace the guessed URL in `.env.example` with the real domain: `https://outletblancosqro.com`.
- [x] Review `git diff` on `src/components/CatalogoSection.vue` and `src/style.css` before committing. The changes implement the catalog, product dialogs, cart/checkout styles, and responsive layout; no merge markers or unexpected external resource references found. Build and whitespace checks pass.
- [x] Order storage: Netlify Blobs plus the Mercado Pago payment dashboard. No additional database account or email service is needed. Verify persistence through an actual test payment before go-live.

## Where things are

- Payment flow: `src/App.vue` (`pay()` and the `onMounted` return handler).
- Server: `api/create-preference.js`, `api/mp-webhook.js`.
- Products and prices: `src/catalog.js`.
- Setup notes in Spanish: `README.md`.
