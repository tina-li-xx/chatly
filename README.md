# Chatting

Async team chat for high-intent visitors. This MVP gives each SaaS account:

- An embeddable widget loaded with `<script src="https://yourapp.com/widget.js" data-site-id="xxx"></script>`
- Per-account authentication with owned sites and isolated inbox data
- Postgres-backed message capture with page URL, referrer, user agent, email, and session tracking
- A team inbox to read threads, tag conversations, and reply by email
- Email-based thread continuation with a webhook endpoint for inbound replies
- Helpful / not helpful feedback capture after each team reply

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Postgres via `pg`
- Resend for outbound email and inbound reply threading

## Recent Updates

- Redesigned the public landing, login, and signup flows around the new Chatting brand.
- Added a guided onboarding flow for widget customization, installation, and verification.
- Shipped the embeddable widget runtime, public conversation APIs, and live conversation plumbing.
- Rebuilt the dashboard into modular inbox, visitors, analytics, settings, team, and widget surfaces.

## 🚀 Key Modules

### Public Site & Auth

- Editorial landing page with modular sections and brand-aligned auth entry flows.
- Dedicated login and signup screens with shared form controls and direct onboarding handoff.

### Onboarding

- Post-signup setup flow for widget customization, install verification, and completion.
- Live verification state that surfaces the actual site URL the widget was detected on.

### Widget & Public APIs

- Embeddable widget with optimistic sending, typing, conversation polling, and install detection.
- Public API endpoints for conversation messages, status, typing, site config, and attachments.

### Dashboard

- Shared dashboard shell with focused pages for inbox, visitors, analytics, team, settings, and widget setup.
- Optimistic inbox interactions for replies and tags, plus modularized page components throughout.

### Billing & Operations

- Stripe-backed billing flows for checkout, portal access, invoice sync, and webhook handling.
- Cloudflare R2-backed team photo uploads for widget presentation.
- Vitest-based app test suite covering routes, pages, helpers, onboarding, widget flows, and billing.

## Ops Note

- Resend is currently managed from the Triggla Gmail account.
- Vercel is currently connected through the personal GitHub account.
- The production Postgres database is hosted on Neon.
- Neon is currently managed from the Letterflow account `tina@letterflow.so`.
- This is only an account-ownership note. Runtime config still comes from environment variables.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `MAIL_FROM`
- `REPLY_DOMAIN` if you want inbound email replies to continue threads
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_BASE_URL` if you want real uploaded team photos in the widget
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_PRO_MONTHLY` if you want real Stripe-backed billing

3. Start the app:

```bash
npm run dev
```

Run the test suite:

```bash
npm test
```

Generate coverage:

```bash
npm run test:coverage
```

The app auto-creates the MVP tables on first request.

For live billing, point Stripe webhooks at:

```text
POST /api/stripe/webhook
```

For local testing, the easiest setup is:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Account Auth

- URL: `/login`
- Create an account with email + password
- The app creates your first site automatically
- Each site gets its own `data-site-id` snippet inside `/dashboard`

## Widget Snippet

```html
<script
  src="http://localhost:3983/widget.js"
  data-site-id="your-site-id"
  data-brand-color="#0f766e"
  data-greeting="Ask us anything before you bounce"
></script>
```

Optional attributes:

- `data-brand-color`
- `data-greeting`
- `data-position`
- `data-api-base`

## Inbound Email Webhook

Configure a Resend webhook to deliver to:

```text
POST /api/email/inbound
```

The outbound email sets `reply-to` as `reply+<conversationId>@<REPLY_DOMAIN>`. The inbound route extracts the `conversationId` from that alias and appends the reply to the correct thread.

Recommended Resend setup:

1. Add a verified sending domain in Resend for `MAIL_FROM`.
2. Set up a Resend receiving domain or use the Resend-managed `*.resend.app` receiving domain.
3. Add a webhook for `email.received` pointing to `POST /api/email/inbound`.
4. Copy the webhook signing secret into `RESEND_WEBHOOK_SECRET`.
5. Set `REPLY_DOMAIN` to the receiving domain you want to use for `reply+<conversationId>@...`.

The inbound route now:

- verifies Resend webhook signatures
- handles `email.received` events
- fetches the full received email body with the Resend Receiving API
- strips common quoted reply blocks before saving the new user message

Official docs:

- [Send Email](https://resend.com/docs/api-reference/emails)
- [Receiving Emails](https://resend.com/docs/dashboard/receiving/introduction)
- [Retrieve Received Email](https://resend.com/docs/api-reference/emails/retrieve-received-email)
- [Verify Webhook Requests](https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests)
