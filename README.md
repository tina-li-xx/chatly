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
- Amazon SES for outbound email and inbound reply threading

## Recent Updates

- Swapped the root app-shell analytics embed to the hosted Grometrics runtime for `usechatting.com` with the new production website id.
- Streamlined dashboard live updates so each tab shares one `/dashboard/live` connection, unread badges use lightweight count fetches, and the visitors page patches presence/message changes incrementally instead of reloading the full snapshot on every live event.
- Added configurable offline and away widget copy with matching dashboard preview states, persisted site settings, and live widget rendering from public config.
- Kept inbox conversations strictly sorted by actual recency so opening, refreshing, and optimistic reply updates no longer jump older threads above newer ones.
- Retained failed conversation-template emails as retryable deliveries with queued retry status, stored delivery metadata, and scheduler-backed resend processing.
- Removed the dashboard’s custom pending overlays so navigation now relies on the shared route skeleton, while tightening inbox thread loading state to avoid stale loading flashes.
- Preserved the original page URL where a visitor started a conversation in the dashboard thread detail, removed page/location badges from preview lists, and consolidated shared conversation display formatting across inbox and home cards.
- Synced dashboard unread badges across the inbox, shell header, and sidebar so opening or receiving conversations updates counts immediately without a manual refresh.
- Hardened Vercel server packaging for Postgres by replacing the opaque `pg` runtime import with a traceable server import and adding a postbuild trace check that fails if `pg` drops out of Next.js server output.
- Resolved a Vercel Node.js Serverless deployment bug bridging Edge ImageResponse limits by routing font loading through the native fs layer and forcing the postgres driver to bundle natively.
- Added dynamic Edge ImageResponse generation for customized Open Graph social cards and a brand-aligned SVG favicon.
- Unified Growth billing around the live `$20 / $6 / $5 / $4` seat pricing, slider-aware landing totals, legacy Pro cleanup, and Stripe tier validation with development-specific Stripe env support.
- Aligned dashboard inbox install prompts with the live widget state and split the inbox surface into smaller shared helpers.
- Tightened the landing-page header so it stays in flow on desktop, removes the white seam below the nav, and collapses into a cleaner mobile nav/action layout.
- Switched Next.js 16 development and production builds back to the default Turbopack path, cleared the stale webpack reload loop, and tightened shared email section typing so builds pass cleanly.
- Added dynamic Edge ImageResponse generation for customized Open Graph social cards and a brand-aligned SVG favicon.
- Refreshed the shipped `/widget.js` runtime so it carries the latest branding-aware site config, richer site-status payloads, and route-change refresh behavior.
- Renamed the app-side widget injector from `chatly-script` to `chatting-script` and removed a stale email transport concern from the contributor log.
- Refreshed contributor docs and planning notes with Chatting branding, a current concerns log, growth strategy notes, and OG image reference guides.
- Added shared app-shell, public auth wrapper, toast, newsletter, and form-control regression coverage.
- Added broad onboarding regression coverage across flow actions, shared helpers, page entry, team setup, and screen states.
- Added focused regression coverage for the free-tool export gate plus the response-time, response-tone, and welcome-message tools.
- Aligned the public landing and pricing surfaces with Chatting copy, shared section typing, and route-level marketing page coverage.
- Updated the shared app button link typing so route-object hrefs work cleanly across invite and landing actions.
- Finished the remaining billing settings cleanup so dashboard pricing and referral surfaces no longer carry trial-extension-era fixture shapes.
- Centralized MiniMax response-tone configuration in the shared env helpers and documented the required API settings in `.env.example`.
- Finished the hosted conversation handoff with a shared resume-message component and fuller conversation template context.
- Hardened dashboard refresh behavior against failed network fetches and aligned public feedback links with the 1-to-5 rating model.
- Kept auth failures user-safe by moving login and signup errors to shared toasts, removing deployment-detail copy from auth screens, and splitting the login auth container into smaller modules.
- Hardened node runtime startup and env loading so server-only services boot in development without leaking into browser bundles.
- Removed the manual trial-extension flow and its related billing route, helpers, and email path.
- Split dashboard settings state into dedicated hooks and aligned notices and navigation with the shared settings scaffold.
- Added signed conversation resume links for visitor emails plus inbox deeplinks for teammate mention notifications.
- Unified transactional, notification, lifecycle, and visitor emails on a single Chatting email shell with matching dashboard previews.
- Added scheduled daily digests and weekly performance emails with per-user delivery tracking from the node runtime.
- Streamlined Stripe price resolution so billing now resolves only against the active Growth monthly and annual prices.
- Added forgot-password and reset-password actions with token-backed reset links from the auth flow.
- Added invite-aware teammate signup, login acceptance, and a dedicated invite landing page for workspace joins.
- Added referral-aware owner signup with seeded workspace billing, welcome emails, and preserved referral codes through auth forms.
- Expanded backend route and data coverage across public APIs, Stripe webhook handling, repositories, and growth/billing services.
- Expanded dashboard coverage across shell, inbox, visitors, widget settings, and dashboard route workflows.
- Renamed the remaining product-facing Chatly references across docs, service labels, invite copy, and pricing-driven blog content to Chatting.
- Upgraded dashboard email templates with conversation-specific previews, transcript branding controls, and richer test-email rendering.
- Aligned billing settings and landing pricing around shared Starter and Growth pricing helpers plus the shared app button styling.
- Added backend Growth trial lifecycle handling for owner billing defaults, local trial extensions, and automatic downgrades for expired unpaid trials.
- Added a dedicated referrals page in billing settings with shareable signup links, copied codes, and tracked signup and reward states.
- Added tiered landing-page pricing cards with Starter and Growth plans plus a Growth team-size slider.
- Added an internal Chatting distribution playbook markdown file under `app/` for growth-channel planning and launch copy.
- Added dashboard growth insights for activation, workspace health, and expansion signals on the home view.
- Added scheduled lifecycle growth nudges for activation, health, and upgrade reminders without running email checks on widget requests.
- Added seat-based `Starter / Growth` packaging with annual pricing, proactive-chat gating, and 7-day trial extensions for active workspaces.
- Tightened the social content generator rules around lowercase output, Chatting branding, and the canonical site URL.
- Removed the visible onboarding step counts to keep setup screens cleaner.
- Split the dashboard home into focused modules and cleaned up empty-state conversation actions.
- Added referral links, signup attribution, and referral reward tracking in billing.
- Added recurring affiliate commission ledger entries tied to paid billing activity.
- Redesigned the public landing, login, and signup flows around the new Chatting brand.
- Added a guided onboarding flow for widget customization, installation, and verification.
- Shipped the embeddable widget runtime, public conversation APIs, and live conversation plumbing.
- Rebuilt the dashboard into modular inbox, visitors, analytics, settings, team, and widget surfaces.
- Added repo guidance, product notes, and design system references for contributors.

## 🚀 Key Modules

### Public Site & Auth

- Editorial landing page with modular sections and brand-aligned auth entry flows.
- The root app shell now loads the hosted Grometrics analytics runtime with the production `usechatting.com` domain and website id.
- The landing header now stays sticky in flow on desktop and uses a dedicated small-screen nav row so the top bar stays compact without layout seams.
- The public landing now keeps the header/CTA framing stable while using the new proof and conversion section split.
- Landing pricing now mirrors the dashboard billing format with Starter and Growth plans driven by shared pricing helpers, and the Growth card total now follows the team-size slider directly.
- Public free-tool workflows now have focused action, form, and result coverage across export-gate and generator/calculator tools.
- Dedicated login and signup screens with shared form controls, referral-aware owner signup, invite-based teammate access, password reset flows, and direct onboarding handoff.
- Auth failures now stay in shared toast notifications with generic user-safe copy instead of showing deployment or server setup details in the UI.
- Shared button-link controls now accept both string and object hrefs so invite and auth flows can pass structured Next.js routes safely.
- Shared layout, auth wrappers, toast plumbing, newsletter actions, and form controls now have dedicated regression coverage.
- Added dynamic Open Graph image generation via `/api/og` to dynamically support brand-aligned social sharing cards for all marketing and blog routes.
- Added Edge-rendered SVG favicon via `app/icon.tsx` for crisp browser tab identity.

### Onboarding

- Post-signup setup flow for widget customization, install verification, and completion.
- Setup screens now rely on the dot progress indicator without repeating step-count copy.
- Live verification state that surfaces the actual site URL the widget was detected on.
- Onboarding now has dedicated regression coverage across flow sections, shared helpers, UI states, and the team route.

### Widget & Public APIs

- Embeddable widget with optimistic sending, typing, conversation polling, and install detection.
- The shipped widget runtime now reads branding-aware site config, sends fuller visitor context to public config/status routes, and refreshes site state on route changes.
- Widget settings now persist customizable offline and away titles/messages, and the live widget renders those saved empty-state messages from site config.
- Public API endpoints for conversation messages, status, typing, site config, and attachments.

### Dashboard

- Shared dashboard shell with focused pages for inbox, visitors, analytics, team, settings, and widget setup.
- Dashboard live updates now share one `/dashboard/live` connection per tab, route unread and conversation refreshes through targeted endpoints, and keep visitors current with incremental session/message patches plus manual full-refresh fallback.
- - Dashboard widget settings now preview online, away, and offline states directly in settings, and inbox thread ordering stays pinned to real recency instead of moving touched threads to the top.
- Dashboard navigation now relies on the route-level skeleton only, and inbox thread selection clears stale loading state without the extra shell overlay layer.
- Dashboard conversation previews now stay message-only, and the thread detail sidebar preserves the original visitor page URL from when the conversation started instead of drifting with later navigation.
- Dashboard unread badges now clear immediately on thread open and stay live across the shell header and sidebar when visitor messages or read events stream in.
- Dashboard inbox install prompts now disappear once the widget is live and share the same install-state wiring across the sidebar card and empty conversation list.
- Dashboard home now uses dedicated metrics, recent-conversations, and sidebar modules with cleaner empty states.
- Dashboard home now surfaces activation, health, and expansion growth signals for the workspace.
- Optimistic inbox interactions for replies and tags, plus modularized page components throughout.
- Dashboard live refresh now tolerates failed fetches without surfacing unhandled browser promise rejections, and public feedback links now resolve numeric ratings cleanly.
- Hosted conversation handoff now renders through a dedicated resume-message component and keeps email template lookups tied to the real site and session context.
- Dashboard settings now resolve sections through dedicated hooks and keep notices inside the shared settings wrapper instead of a separate loading shell.
- Visitor emails and teammate mention alerts now deeplink back into the exact conversation or note context instead of generic inbox entry points.
- Dashboard email settings now preview transcript and visitor email layouts through the same canonical shell used for live sends.
- Dashboard shell, inbox, visitors, widget settings, and route handlers now have broad Vitest coverage across interactive and edge-case flows.

### Billing & Operations

- Postgres server packaging now uses a traceable `pg` import plus a postbuild trace verification step so Vercel deploys fail fast if Next.js stops tracing the database driver into server output.
- Conversation-template emails now keep failed deliveries for automatic retry, surface queued retry state back to the dashboard, and run through scheduler-backed resend jobs with distributed locks.
- Stripe-backed billing flows for checkout, portal access, invoice sync, and webhook handling.
- Growth billing now runs from a shared seat-pricing config, validates Stripe's tiered Growth price shape before checkout, and prefers `STRIPE_DEV_*` billing credentials and price ids outside production.
- Billing price resolution now relies only on the current Growth Stripe price ids.
- Scheduled daily digests and weekly performance reports now send from the node runtime with persisted delivery windows.
- Owner workspaces now default to a backend-seeded Growth trial and automatically downgrade expired unpaid trials to Starter.
- Billing settings fixtures and cards now consistently use the post-trial-extension billing shape across dashboard tests and widget settings.
- Scheduled lifecycle nudges now deliver activation, health, and upgrade reminders from the node runtime instead of widget pageviews.
- Seat-based `Growth` billing with monthly/annual pricing, plan-aware widget gating, and trial-extension support for active workspaces.
- Billing settings now share the same Starter and Growth pricing presentation as the landing page, backed by shared pricing primitives and button styles.
- Public APIs, Stripe billing flows, repositories, and growth services now have broad backend coverage in the Vitest suite.
- Referral programs with per-workspace codes and paid-conversion reward tracking in billing settings.
- Billing settings now include a dedicated referrals page with program cards, direct signup links, and referred-signup status tracking.
- Affiliate commission ledger visibility tied to paid billing activity.
- Cloudflare R2-backed team photo uploads for widget presentation.
- Vitest-based app test suite covering routes, pages, helpers, onboarding, widget flows, and billing.

### Contributor Docs

- Repo agent guidance, product context, and design-system reference docs live alongside the codebase.
- Email sender and subdomain reference docs live in [CHATTING_EMAIL_ADDRESSES.md](./CHATTING_EMAIL_ADDRESSES.md).
- Next.js config now follows the default Turbopack dev/build path, and the concerns log tracks the remaining `metadataBase` and Edge-runtime build warnings.
- Contributor guidance now avoids the legacy `chatly-script` app-shell filename and no longer tracks the removed `sendRichEmail` concern as a live issue.
- Contributor docs now include a refreshed concerns log, growth strategy notes, TODO tracking, and Chatting-branded OG image guidance/templates.
- Product docs, service labels, and pricing-driven blog copy now use the Chatting brand consistently.
- The social content generator now enforces lowercase output, `https://usechatting.com`, and Chatting-first branding.
- The app now includes an internal Chatting distribution playbook markdown file for channel planning and launch messaging.
- Env definitions and runtime guards now keep node-only startup and service config isolated from client bundles.
- The example env file now documents the MiniMax API settings used by the response-tone checker service.

## Ops Note

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
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` if you are not using an attached IAM role
- `REPLY_DOMAIN` and `SES_INBOUND_SNS_TOPIC_ARN` if you want inbound email replies to continue threads
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_BASE_URL` if you want real uploaded team photos in the widget
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_GROWTH_MONTHLY`, and `STRIPE_PRICE_GROWTH_ANNUAL` if you want real Stripe-backed billing

Paid Stripe prices should be configured as graduated tiers so seats 1-5 bill at the plan rate and seats 6+ bill at the lower overflow rate.

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

## Email Setup

Outbound email and inbound reply threading both use Amazon SES.

- founder replies set `Reply-To` to `reply+<conversationId>@<REPLY_DOMAIN>`
- SES receives that inbound reply and sends an SNS notification to `POST /api/email/inbound`

## Inbound Email Webhook

Configure an SNS HTTPS subscription to deliver to:

```text
POST /api/email/inbound
```

The outbound email sets `reply-to` as `reply+<conversationId>@<REPLY_DOMAIN>`. The inbound route extracts the `conversationId` from that alias and appends the reply to the correct thread.

Recommended setup:

1. Verify the built-in sender addresses under `usechatting.com`, `mail.usechatting.com`, and `notifications.usechatting.com` in Amazon SES, and move the SES account out of sandbox if you need to send to unverified recipients.
2. Create an SES receipt rule for the domain or subdomain used in `REPLY_DOMAIN`.
3. Add an SNS action to that receipt rule and configure it to include UTF-8 email content.
4. Subscribe `POST /api/email/inbound` to that SNS topic.
5. Set `SES_INBOUND_SNS_TOPIC_ARN` to that SNS topic ARN.
6. Set `REPLY_DOMAIN` to the SES-receiving domain you want to use for `reply+<conversationId>@...`.

The inbound route now:

- verifies SNS signatures
- auto-confirms SNS subscription requests
- handles SES `Received` notifications
- parses raw MIME email content with `mailparser`
- strips common quoted reply blocks before saving the new user message
- Added configurable offline and away widget copy with matching dashboard preview states, persisted site settings, and live widget rendering from public config.
- Widget settings now persist customizable offline and away titles/messages, and the live widget renders those saved empty-state messages from site config.
- Dashboard widget settings now preview online, away, and offline states directly in settings.
