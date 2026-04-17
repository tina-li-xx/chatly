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

- Zapier setup now links to starter Zaps straight from the integrations screen, and the Zapier guides now include troubleshooting plus a direct Zapier-support path for broken workflows.
- Team new-message emails now hide redundant hosted-conversation URLs when a visitor replies from the hosted thread, keeping the alert focused on the inbox action that actually handles the conversation.
- Chatting now has a broader API reference that separates the supported Zapier integration endpoints from first-party widget and dashboard routes, giving Zapier reviewers and partners one clearer source of truth.
- Trial-ended emails now say the workspace moves to Starter instead of incorrectly claiming the widget is paused, so billing lifecycle copy matches the actual post-trial behavior.
- The desktop dashboard sidebar no longer shows the founder-only Switchboard entry, keeping the main team navigation focused on everyday workspace areas.
- Plans & Billing no longer shows generic `Discard` and `Save changes` buttons in the header, keeping billing actions focused on plan, invoice, and portal controls.
- The app icon now ships from a static `app/icon.png` asset, so production builds no longer warn that the icon route disables static generation.
- Digital marketing assets now include first-pass TikTok ICP notes plus a fresh set of iPhone simulator captures for App Store materials.
- Commit approval now requires showing exact public changelog edits up front, and the public changelog dropped a vague email-polish bullet.
- Dashboard proxy auth now honors bearer-token requests without forcing a cookie redirect, and the shared env catalog now includes the FCM push settings used by native team delivery.
- Publishing preview drafts can now be deleted from the switchboard, and linked plan topics return to Plans immediately when a draft is removed.
- Trial-ended emails now show Growth pricing as stacked tier lines, so upgrade options are easier to scan at a glance.
- Founder switchboard now combines SaaS CRM visibility and internal publishing controls under one hidden dashboard entry point, and legacy publishing links redirect into the matching switchboard section.
- Dashboard tables now share one header-label style token across billing history, publishing queue, analytics, referrals, and team views for more consistent internal UI.
- Publishing a generated blog draft now refreshes the public blog, author page, post page, and sitemap immediately, and production builds no longer stall on workspace-backed blog draft lookups.
- Workspace-access SQL helpers now import from their source repository instead of the mixed workspace barrel, avoiding Next server-route build failures around missing static re-exports.
- The repo now includes reusable App Store screenshot source files, render scripts, and finished iPhone submission assets for future mobile releases.
- Wrapped server routes now log request-scoped start, response, and failure entries, so route error alerts are easier to trace back to the exact request that triggered them.
- Existing invited teammates now go straight to sign in with the invited email prefilled, and valid invite sign-ins auto-verify the invited account instead of stalling on a separate verification step.
- Non-admin teammates now only see conversations assigned to them, and member inbox views stay focused on open and resolved assigned work instead of misleading all-chat filters.
- Chatting now has a native iPhone team app with a mobile inbox, assignment handoff, settings, and push notifications for new conversations.
- Dashboard and public multipart routes now share one form-data parsing helper, so uploads and route validation stay aligned without duplicated request parsing code.
- Growth upgrades now show the full checkout amount up front, including the Stripe processing fee, and confirming the upgrade starts the paid plan instead of another trial.
- Shared auth, dashboard, and settings support copy now renders one shade darker in the shared shells so secondary text is easier to read at a glance.
- Shared Chatting links now serve their branded social preview image again, so X/Twitter and similar crawlers can render the intended OG card instead of falling back to a text-only preview.
- The iOS SDK now supports APNs token registration, attachment uploads, and automatic conversation refresh when a native app becomes active again.
- Mobile push delivery now supports native iOS APNs alongside Expo, so team replies can reach backgrounded iPhone apps after those apps register a device token.
- The Reddit reply generator now treats links and direct service mentions as conditional, so prompt guidance is safer in subreddits where automod may remove obvious promo patterns.
- Repo guidance now requires `npm run build` after any user-requested test run, so verification reports always include both test and build status.
- JetBrains `.idea/` project files are now ignored in git so local workspace metadata stays out of the shared worktree.
- Email-template preview tests now use the hosted `https://usechatting.com` origin so dashboard preview coverage matches the current public app URL.
- Growth billing now expands Stripe price tiers during validation, so tiered Growth price checks inspect the full Stripe price shape before checkout flows use it.
- Scheduled Zapier deliveries now retry database reads and delivery-state writes after transient Postgres auth timeouts instead of aborting the whole run on the first connection failure.
- Unreadable encrypted integration credentials now fail closed to `null` instead of escaping as parse errors, so broken saved credential blobs no longer crash the shared parser path.
- The public guide library now follows a clearer step-by-step docs structure, and the landing footer resources link now labels `/guides` correctly instead of calling it Help Center.
- The public guides library now includes dedicated iOS SDK and Expo/React Native setup walkthroughs with install steps, client setup, and verification sections.
- The iOS SDK docs and demo scaffold now show the real app-level support-sheet integration pattern, including required config values and signed-in identify flows.
- Chatting now has a published React Native and Expo package, so mobile teams can add an in-app support screen, live conversation updates, and Expo push registration without building their own client layer first.
- Live dashboard and public conversation updates now fan out through a shared Redis bridge, so realtime events stay in sync across multiple app instances instead of depending on one process-local listener map.
- Mobile chat apps can now register push devices against public conversations, and the shared public API CORS helpers now support the register/unregister flow cleanly with `DELETE`.
- Scheduled digests, weekly reports, and lifecycle reminder jobs now recover from brief database connection stalls more gracefully, so routine Chatting emails are less likely to get dropped after a transient infra hiccup.
- Homepage and author-page social previews now use a versioned OG image URL and updated hero-card copy so LinkedIn and similar networks refresh to the current Chatting preview instead of holding onto stale blank cards.
- Chatting now has a first-party iOS SDK with Swift Package Manager and CocoaPods distribution, so teams can add visitor chat to native apps with live conversation sync, email capture, and a lightweight SwiftUI wrapper.
- The Zapier setup modal now shows direct docs links, available triggers/actions, and starter workflow recipes in one scrollable setup view.
- Locked integrations now open the Growth confirmation modal in place, so teams can review billing before unlocking Zapier, Slack, Shopify, or webhooks.
- Blog and Guides now share one cleaner public nav, and code snippets across articles render with proper inline code and copy-friendly snippet styling.
- Zapier now has a dedicated API reference plus a starter-Zaps guide, so teams can connect Chatting faster and copy proven workflows without guessing through setup.
- Live events unit coverage now stubs the Redis bridge directly so local publish/subscribe tests stay deterministic without weakening runtime Redis requirements.
- Growth health regression coverage now matches the shared compact response-time formatter, keeping dashboard score-card tests aligned with labels like `2h` and `4h 10m`.
- Billing lifecycle jobs now normalize repository timestamps before growth-trial reminders run, preventing `Date`-shaped billing values from crashing scheduled lifecycle emails.
- Dashboard response-time metrics now use readable mixed units like `1m 12s`, `1h 1m`, and `1d 7h` instead of long raw minute counts.
- Email verification now uses the same shared auth screen styling as sign-in, and signup confirmation lets people fix a mistyped email through one inline `Edit it` action.
- Logout and auth redirects now use the configured app URL so sign-out no longer bounces people to container-only hosts like `0.0.0.0:8080`.
- Inbox contact tags now add on Enter, update optimistically, and sit in a cleaner shared tags block so teammates can edit thread context faster.
- Slack, Zapier, Shopify, and webhook settings now live in one integrations area with real connection state, live backend routes, and working Zapier triggers/actions for teams building automations around Chatting.
- The public guides library now includes dedicated Slack, Zapier, Shopify, and webhooks setup walkthroughs so teams can get integrations live without guessing through the setup.
- Dashboard now includes an internal publishing queue and preview workspace, and the Publishing nav only appears for the designated reviewer account.
- Scheduled April and May blog backlog posts now cover Gorgias, customer-support software, Zendesk alternatives, low-conversion diagnosis, small ecommerce support workflow, Shopify live-chat growth uses, a small-business worth-it guide, and a live-chat benefits explainer.
- Onboarding now finishes directly in the dashboard, and the old standalone done screen no longer appears as a separate end state.
- Centralized admin error alerts now cover wrapped routes, server actions, browser exceptions, and process-level failures, with dev/build checks that block new unwrapped server entry points.
- The marketing blog now supports hidden drafts, scheduled auto-publishing, a shared editorial calendar, and a queued traffic-to-conversion diagnosis draft for the April content backlog.
- The SEO prompt library now forces a source-abstraction step so Reddit/forum ideas do not overfit to exact numbers, platforms, or niche examples.
- Landing, signup, onboarding, widget settings, billing upgrades, and inbox replies now share funnel-event tracking, while dashboard settings navigation and hosted reply follow-up feel smoother in day-to-day use.
- AI Assist is now built into the inbox with reply suggestions, summaries, rewrites, suggested tags, starter usage limits, and a full activity log.
- Dashboard home, inbox, and thread loading now do less work up front so the main team views open faster.
- Added a public guides area plus a dedicated inbox shortcuts guide, with direct shortcuts-guide entry points from the dashboard inbox.
- Solo workspaces now hide pointless assignment UI so one-person teams no longer see unassigned filters and controls that imply another teammate exists.
- Tightened public indexing signals by noindexing utility/help routes, adding legal-page canonicals, and making the legacy ROI tool URL a permanent redirect.
- Blog post registration now auto-generates during `dev` and `build`, so new `src/lib/blog-post-*.ts` files automatically feed the published blog routes and sitemap.
- Updated public changelog notes so follow-up routing and email changes read like product updates instead of engineering filler.
- Kept weekly performance heatmap snapshots build-safe by typing their computed intensity rows explicitly.
- Split the People contact data layer into focused services so profile, note, and sync changes are easier to maintain.
- Visitor routing now handles empty tags and incomplete custom-field values more gracefully.
- Visitor follow-up templates now avoid repeating extra conversation-link instructions when they already include them.
- Aligned Drizzle config and cached DB typing so schema-backed Postgres builds stay clean.
- Tightened public landing route typing so shared nav and footer links stay build-safe.
- Tightened repo changelog rules so public entries stay customer-facing and skip internal-only filler.
- Added People contact profiles with saved contact history, statuses, custom fields, and in-place profile editing.
- Stabilized inbox contact editing, visitor notes, and the supporting dashboard settings flows around the new People experience.
- Fixed newsletter signup source syncing for brand-new subscribers.
- Refreshed blog, legal, and pricing regressions to match current public-site copy.
- Refreshed email rendering regressions to match current markup and delivery wiring.
- Realigned conversation, settings, visitors, digest, and access fixtures with current backend behavior.
- Published a Chatting-first comparison post covering the best live chat tools for small businesses and where Chatting, Crisp, Tidio, HubSpot, and tawk.to fit.
- Added a reusable digital-marketing prompt library for Chatting SEO posts, including master, comparison, how-to, and Reddit-to-article prompts.
- Tightened the SEO prompt library so every article draft starts Chatting-first instead of beginning as a neutral roundup.
- Published an after-hours e-commerce case study showing how small stores can capture better leads without a 24/7 team.
- Built a dedicated Automation settings editor for offline behavior, routing, FAQ suggestions, and proactive messages.
- Wired automation into the live widget so FAQ suggestions, routing, and proactive prompts now run against real visitor sessions.
- Settings sections now navigate by URL so each settings area can load as its own server-driven view.
- Saved replies now live in a dedicated settings area with cleaner modal-based management.
- Added sitemap/robots, homepage SEO metadata and copy, author profile pages, and keyword-targeted blog routes to improve public search discovery.
- Simplified the public landing proof section by hiding the metrics/testimonials strip and removing the empty divider row from the three feature cards.
- Owner signup now stays on the signup page with inline verification messaging, password login blocks unverified accounts, and the sign-in form drops the dead remember-me/resend-verification clutter.
- Signup verification now lets people jump back to the signup form from the "Check your email" screen so they can correct details and resubmit without leaving the flow.
- Deleted the unused legacy `/onboarding/team` route and its tests so onboarding no longer carries a dead team-setup endpoint.
- Removed the forced `site` suffix from default owner workspace names so new email-domain-based sites no longer ship customer-facing labels like `Heypond site`.
- Added root TypeScript support for Vitest globals so colocated test files keep passing Next build type-checks.
- Shared button links now support internal Next routes plus external `mailto:`, `tel:`, and absolute URL hrefs without typed-route build failures.
- Kept auth server actions build-safe by importing password recovery actions from their dedicated module and tightening shared auth route typing.
- Fixed the dashboard inbox retry CTA wiring so failed optimistic replies can actually resend through the thread detail panel again.
- Dashboard inbox replies now keep failed team messages inline with retry, preserve optimistic thread state, and leave the composer editable while earlier sends finish.
- Based the dashboard home conversations card on rolling local 7-day windows using the saved teammate timezone for local date boundaries and previous-period comparison.
- Wired the dashboard home conversations selector to real rolling `7 / 30 / 90` day ranges with matching comparison labels.
- Kept the dashboard home conversations range off the browser URL by fetching card updates locally and refreshing the server chart after timezone sync lands.
- Added signup-triggered email verification delivery, resend-verification recovery from login, and a public `/verify` page for consuming email tokens.
- Preserved safe post-login return paths back to the original internal URL after auth, resumed owner onboarding on sign-in, and split the auth/login flow into smaller modules with focused regression coverage.
- Logged-out dashboard deep links now route through login with their original internal URL preserved instead of dropping users onto the default post-auth screen.
- Added a root Next.js proxy that short-circuits obvious WordPress bot-probe paths so junk traffic returns a cheap `404` before it reaches the app.
- Defaulted the shared public app URL fallback to `https://usechatting.com` so generated widget snippets no longer fall back to localhost when `NEXT_PUBLIC_APP_URL` is unset.
- Tightened dashboard reply rollback coverage so recency-based summary sorting no longer makes the regression test fail on array position alone.
- Localized daily digests and weekly performance emails to teammate timezones, with dashboard-side browser timezone sync and shared local report window helpers.
- Added Cloud Run deployment packaging with standalone Next.js output, a repo `cloudbuild.yaml`, and DB-claimed scheduler windows plus advisory locks so startup email jobs do not double-run across instances.
- Fixed the production build by tightening widget offline-copy field typing, conversation-template retry status returns, mail-from sender resolution, and shared scheduler test-helper imports.
- Added Cloud Run deployment packaging with standalone Next.js output, a repo `cloudbuild.yaml`, and DB-claimed scheduler windows plus advisory locks so startup email jobs do not double-run across instances.
- Swapped the root app-shell analytics embed to the hosted Grometrics runtime for `usechatting.com` with the new production website id.
- Skipped the hosted Grometrics script on localhost-style hosts and reused one shared local-host helper for analytics and installation checks.
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

### Platform & Runtime

- The app icon now resolves from a static `app/icon.png` asset instead of an Edge-runtime icon route, removing the static-generation warning from production builds.
- Dashboard proxy auth now lets bearer-authenticated requests pass through without a cookie redirect, and the shared env catalog now documents the FCM push settings used by team mobile delivery.
- Workspace access SQL helpers now resolve from their source repository instead of the mixed workspace barrel, so Next server and app-route builds no longer trip over missing static helper exports.
- Wrapped server routes now emit request-scoped start, response, and failure logs, so alerting and timing are traceable back to one request id instead of a loose console trail.
- Dashboard and public multipart routes now share a smaller route-form-data helper, and attachment extraction now accepts the narrower `getAll(...)` shape those server handlers actually use.

### Mobile App & Delivery

- The iPhone marketing asset set now includes fresh simulator captures across inbox, chat, assignment, notification, and settings states for future App Store submissions.
- The repo now includes reusable App Store screenshot source files, render scripts, and finished iPhone submission assets for future mobile releases.
- Chatting now ships an Expo-based iPhone app with email/password sign-in, a dedicated inbox and thread flow, mobile settings, role-aware inbox filtering, assignment actions, and push-permission onboarding.
- Mobile API routes now cover session bootstrap, availability, password recovery, profile edits, device registration, and notification preferences for the native app.
- Team mobile delivery now supports Expo, APNs, and FCM transports, and new conversations plus assignment handoffs can trigger native push notifications back into the mobile inbox.

### Public Site & Auth

- Zapier guides now include troubleshooting steps for stale connections, missing sample data, and broken workflows, along with a direct Zapier support path for live Zap issues.
- Chatting now includes a broader API reference guide that explains which endpoints are supported for external integrations and which routes are first-party widget or dashboard runtime paths.
- Publishing a blog draft now revalidates the public blog index, author page, post page, and sitemap immediately, while production builds skip workspace-backed generated-draft reads so blog static generation stays reliable.
- Existing invited teammates now bypass the old choice screen, land directly on sign in with the invited email prefilled, and can finish a valid invite sign-in without getting stuck behind a separate verification step.
- Shared auth-shell captions and supporting hero copy now use slightly darker secondary text for better legibility.
- Shared social preview links now resolve through the live `/api/og` route again, so Chatting landing-page shares can return the intended branded image on X/Twitter and similar crawlers instead of a text-only card.
- The public guide library now uses a more direct installation-doc structure across shortcuts, Slack, Shopify, webhooks, and Zapier pages, and the landing footer now labels the `/guides` destination correctly.
- The public guides library now includes dedicated iOS SDK and Expo/React Native setup guides alongside the existing integrations walkthroughs.
- Shared social preview metadata now points at a versioned OG image URL, and the default homepage OG card copy now matches the current Chatting positioning so cached blank previews can refresh cleanly on LinkedIn and similar platforms.
- Blog and Guides now share one public content shell, and guide/article code snippets render with cleaner inline-code and block-snippet styling.
- Email verification screens now stay inside the shared auth shell, and signup confirmation offers an inline `Edit it` action so people can correct the email address they just used without leaving the flow.
- Logout and auth redirects now resolve from the configured public app URL so container runtime hosts do not leak into browser redirects.
- The marketing blog backlog now includes scheduled comparison, conversion, ecommerce workflow, decision-guide, and explainer posts that unlock from their target publish dates across April and May.
- Onboarding now resolves completed workspaces straight to the dashboard, and the old `/onboarding?step=done` success screen has been removed.
- The marketing blog now supports `draft` and `scheduled` publication states, short revalidation-based auto-publishing, and a shared publishing calendar for spacing queued posts.
- Landing, signup, and onboarding now share consistent funnel-event tracking so signup starts, completed logins, completed signups, onboarding saves, snippet copies, and install checks can all be attributed in one flow.
- The public site now includes a dedicated guides area, and the inbox shortcuts guide is linked directly from the dashboard for easier discovery.
- The public guides library now also includes dedicated setup walkthroughs for Slack, Zapier, Shopify, and webhooks.
- Zapier guides now include a dedicated API reference and a starter-Zaps page with copy-ready workflow names, descriptions, and recipes for alerting, logging, imports, and automatic replies.
- Utility public routes like feedback, verification, preference links, and hosted help-center pages now emit explicit `noindex` metadata, while legal pages expose canonicals and the legacy ROI calculator path permanently redirects to its indexed free-tool URL.
- Shared landing navigation and footer links now stay aligned with Next route typing during production builds.
- Newsletter signups now preserve source updates correctly even for first-time subscribers.
- Public marketing regression coverage now matches the current blog, legal, and pricing copy.
- Editorial landing page with modular sections and brand-aligned auth entry flows.
- Marketing SEO now ships a generated sitemap/robots setup, homepage-specific metadata and copy, crawlable blog/free-tools links, author profile pages, and keyword-targeted blog slugs and aliases.
- The marketing blog now includes a Chatting-first small-business live-chat comparison post aimed at high-intent buyers evaluating chat tools.
- The marketing blog now also includes an after-hours e-commerce lead-capture case study built around off-hours buyer questions and lightweight follow-up.
- The public landing now hides the metrics/testimonials proof strip, and the three feature cards no longer render empty footer dividers when no stat copy is configured.
- The signup verification state now includes a return path back to the signup form so people can correct a mistyped email or other account details before submitting again.
- Auth forms now pull forgot/reset/resend server actions from the dedicated password-actions module, and shared auth redirect helpers stay typed for Next route redirects during builds.
- The root app shell now loads the hosted Grometrics analytics runtime with the production `usechatting.com` domain and website id.
- The root app shell now skips Grometrics on localhost-style hosts during local development while still loading it on deployed hosts.
- The landing header now stays sticky in flow on desktop and uses a dedicated small-screen nav row so the top bar stays compact without layout seams.
- The public landing now keeps the header/CTA framing stable while using the new proof and conversion section split.
- Landing pricing now mirrors the dashboard billing format with Starter and Growth plans driven by shared pricing helpers, and the Growth card total now follows the team-size slider directly.
- Public free-tool workflows now have focused action, form, and result coverage across export-gate and generator/calculator tools.
- Dedicated login and signup screens with shared form controls, referral-aware owner signup, invite-based teammate access, password reset flows, safe post-login return paths, owner-onboarding resume handling, inline verification guidance for new owner signups, and direct invite handoff into the dashboard.
- Logged-out dashboard requests now pass their original internal path through the auth proxy so login can return users to the exact screen they opened.
- Signup now sends email-verification links, owner password login stays blocked until verification, invited teammates complete auth with workspace-aware sessions, and public `/verify` routes consume verification tokens.
- Auth failures now stay in shared toast notifications with generic user-safe copy instead of showing deployment or server setup details in the UI.
- Shared button-link controls now accept Next route objects plus external string hrefs like `mailto:`, `tel:`, and absolute URLs so invite, auth, and billing flows can share one safe link primitive.
- Shared layout, auth wrappers, toast plumbing, newsletter actions, and form controls now have dedicated regression coverage.
- Added dynamic Open Graph image generation via `/api/og` to dynamically support brand-aligned social sharing cards for all marketing and blog routes.
- Added Edge-rendered SVG favicon via `app/icon.tsx` for crisp browser tab identity.

### Onboarding

- Post-signup setup flow for widget customization, install verification, and completion.
- The current setup flow no longer carries the deprecated `/onboarding/team` endpoint.
- Owner onboarding now seeds the first site name from the signup email domain label without automatically appending a trailing `site`.
- Setup screens now rely on the dot progress indicator without repeating step-count copy.
- Live verification state that surfaces the actual site URL the widget was detected on.
- Onboarding now has dedicated regression coverage across flow sections, shared helpers, UI states, and the team route.

### Widget & Public APIs

- The iOS SDK now supports APNs token registration, attachment uploads, and lifecycle-aware conversation refresh when a native app returns to the foreground.
- Public mobile-device registration and team-reply delivery now support native iOS APNs alongside Expo for mobile push notifications.
- The iOS SDK README and demo scaffold now show the recommended support-sheet integration pattern with explicit `baseURL`, `siteId`, and identify/email examples.
- Chatting now also ships a published React Native and Expo package with session storage, live conversation sync, push registration helpers, and a drop-in support screen.
- Live dashboard and public conversation updates now fan out through a shared Redis bridge instead of a single-process listener map.
- Public mobile device registration, Expo push-backed team reply delivery, and shared `DELETE`-capable CORS helpers now support mobile register and unregister flows.
- Chatting now includes a first-party iOS SDK with Swift Package Manager and CocoaPods support, covering visitor session storage, live conversation sync, email capture, identify flows, and a lightweight SwiftUI chat surface for native apps.
- Hosted conversation resume replies now keep the composer focused during sends, and public follow-up replies can now emit consistent reply activity events for funnel analysis.
- Embeddable widget with optimistic sending, typing, conversation polling, and install detection.
- The shipped widget runtime now reads branding-aware site config, sends fuller visitor context to public config/status routes, and refreshes site state on route changes.
- The live widget now runs Automation FAQ suggestions, proactive prompts, and profile-aware routing inputs from the public automation payload.
- Visitor routing helpers now drop empty tags and incomplete custom-field values more safely before those inputs reach automation rules.
- Widget settings now persist customizable offline and away titles/messages, and the live widget renders those saved empty-state messages from site config.
- Public API endpoints for conversation messages, status, typing, site config, and attachments.

### Dashboard

- The Zapier integration card now links directly to the starter-Zaps and setup-guide pages, so teams can find recommended workflows without opening the setup modal first.
- Team new-message emails now drop hosted conversation resume URLs from teammate alerts when the inbox CTA already opens the same thread, keeping notification emails focused on the actual inbox handoff.
- The desktop dashboard sidebar now hides the founder-only Switchboard entry so the main workspace nav stays focused on everyday team areas.
- Publishing preview drafts can now be deleted directly from the switchboard, and removing a draft sends its linked topic back to Plans so it can be regenerated cleanly.
- Dashboard tables now share a single header-label style token across billing history, publishing queue, analytics, referrals, and team views so internal reporting surfaces stay visually aligned.
- Non-admin teammates now only see conversations assigned to them, and member inbox tabs stay focused on open and resolved assigned work instead of implying access to the whole shared queue.
- Shared dashboard headers, settings cards, toggles, and nav descriptions now use slightly darker secondary text so lower-emphasis copy reads more clearly.
- Email-template preview tests now use the hosted `https://usechatting.com` origin to match the current dashboard preview environment.
- Live-event unit coverage now isolates Redis bridge bootstrapping while production dashboard updates still run through the strict Redis-backed bridge.
- Dashboard growth-health coverage now follows the same shared response-time formatter used by the live score cards.
- Locked integrations now route through the shared Growth confirmation modal from settings instead of sending teams out to billing immediately.
- The Zapier integrations modal now includes direct guide links, the trigger/action list, starter workflow recipes, and a scrollable layout for taller setup content.
- Response-time metrics across dashboard home, billing, and health summaries now render in readable mixed units so long waits are easier to scan at a glance.
- Inbox tag editing now feels faster, with Enter-to-add contact tags, optimistic updates in the sidebar and contact drawer, and a cleaner shared tags presentation in thread detail.
- Dashboard settings now include a full Integrations area for Slack, Zapier, Shopify, and webhooks, with live connection flows, persisted workspace state, and dedicated modal-based setup.
- Founder-only switchboard now combines SaaS CRM rollups, attention/activity views, and the internal publishing workspace under one hidden dashboard entry point, while legacy publishing URLs redirect into matching switchboard sections.
- Dashboard settings, widget setup, billing upgrades, and inbox replies now emit shared funnel and activation events, and settings/profile navigation stays in-app for faster transitions.
- AI Assist is now built into the inbox with reply suggestions, summaries, rewrites, suggested tags, starter usage metering, warning states, and detailed usage history.
- Dashboard home, inbox, and thread loading now use lighter data paths so key team views open faster.
- Solo workspaces now hide assignment badges, filters, and controls that only make sense once a team has more than one member.
- People now stores contact memory with saved profiles, statuses, custom fields, and in-place profile editing.
- People contact data services now live in focused modules for access, sync, mutations, notes, and settings instead of one oversized data file.
- Inbox contact editing and visitor-note flows now stay aligned with the new People experience across the dashboard.
- Shared dashboard shell with focused pages for inbox, visitors, analytics, team, settings, and widget setup.
- Dashboard settings now include a dedicated Automation editor for offline behavior, routing, FAQ suggestions, and proactive messages.
- Settings sections now navigate by real section URLs so each area can load as a cleaner server-driven view.
- Saved replies now live in their own dedicated settings area with standalone management.
- Dashboard thread detail now routes inline retry actions through the exported inbox state handler again so failed optimistic replies can resend reliably.
- Dashboard shell now syncs each teammate's browser timezone so timezone-aware scheduled emails can use local delivery windows.
- Dashboard live updates now share one `/dashboard/live` connection per tab, route unread and conversation refreshes through targeted endpoints, and keep visitors current with incremental session/message patches plus manual full-refresh fallback.
- Dashboard widget settings now preview online, away, and offline states directly in settings, and inbox thread ordering stays pinned to real recency instead of moving touched threads to the top.
- Dashboard navigation now relies on the route-level skeleton only, and inbox thread selection clears stale loading state without the extra shell overlay layer.
- Dashboard conversation previews now stay message-only, and the thread detail sidebar preserves the original visitor page URL from when the conversation started instead of drifting with later navigation.
- Dashboard unread badges now clear immediately on thread open and stay live across the shell header and sidebar when visitor messages or read events stream in.
- Dashboard inbox install prompts now disappear once the widget is live and share the same install-state wiring across the sidebar card and empty conversation list.
- Dashboard home now uses dedicated metrics, recent-conversations, and sidebar modules with cleaner empty states.
- Dashboard home conversations now use saved-teammate-timezone rolling local 7-day windows instead of a fixed DB-timezone calendar week.
- Dashboard home conversations now let the selector switch between real rolling `7 / 30 / 90` day ranges with matching labels.
- Dashboard home conversation range changes now stay local to the card instead of mutating the page URL, and pending timezone sync can refresh the chart once the saved preference is available.
- Dashboard home now surfaces activation, health, and expansion growth signals for the workspace.
- Optimistic inbox interactions for replies and tags, plus modularized page components throughout.
- Dashboard inbox replies now keep failed team messages in-thread with inline retry and let teammates keep drafting while the previous send is still settling.
- Dashboard live refresh now tolerates failed fetches without surfacing unhandled browser promise rejections, and public feedback links now resolve numeric ratings cleanly.
- Hosted conversation handoff now renders through a dedicated resume-message component and keeps email template lookups tied to the real site and session context.
- Dashboard settings now resolve sections through dedicated hooks and keep notices inside the shared settings wrapper instead of a separate loading shell.
- Visitor emails and teammate mention alerts now deeplink back into the exact conversation or note context instead of generic inbox entry points.
- Dashboard email settings now preview transcript and visitor email layouts through the same canonical shell used for live sends.
- Dashboard reply regression coverage now asserts rollback state by conversation id so recency sorting can stay intact without brittle array-order expectations.
- Dashboard shell, inbox, visitors, widget settings, and route handlers now have broad Vitest coverage across interactive and edge-case flows.

### Repository & Tooling

- Git now ignores JetBrains `.idea/` project files so local IDE workspace metadata stays out of the shared Chatting worktree.

### Billing & Operations

- Trial-ended lifecycle emails now describe the real fallback correctly by telling teams their workspace moved to Starter instead of saying the widget was paused.
- Plans & Billing no longer shows generic save/discard buttons in the page header, so billing settings stay focused on plan changes, invoices, and portal actions.
- Trial-ended emails now show Growth pricing in stacked tier rows instead of one wrapped sentence, making the upgrade path easier to scan after a trial ends.
- Starter-to-Growth upgrades now show the plan subtotal, Stripe processing fee, checkout total, and due-today amount before redirecting to Stripe, and confirming the upgrade starts the paid plan immediately instead of beginning another Growth trial.
- Growth billing now expands Stripe price tiers during validation so tiered Growth price checks run against the full Stripe payload.
- Scheduled Zapier delivery jobs now retry due-delivery reads and delivery-state writes after transient Postgres auth timeouts.
- Unreadable encrypted integration credentials now resolve to `null` instead of escaping as parser errors during integration setup and reads.
- Scheduled digests, weekly reports, and growth reminder jobs now recover from transient database auth timeouts more safely, reuse shared report snapshots inside a run, and clean up delivery claims after send failures so teams are less likely to miss routine email updates.
- Billing repositories now normalize trial, invoice, and payment-method timestamps to ISO strings before lifecycle and reminder services consume them.
- Admin error alerting now routes server request failures, browser exceptions, and process/runtime crashes through one shared email pipeline, and repo verification blocks new routes or server actions from skipping the shared wrappers.
- Weekly performance heatmap snapshot generation now stays build-safe while preserving the same report output.
- Visitor follow-up email templates now avoid repeating extra conversation-link guidance when that instruction is already present.
- Drizzle config and cached database typing now stay aligned with the schema-backed Postgres setup during production builds.
- Email rendering coverage now matches the current shared HTML shell and rendered delivery path.
- Conversation, settings, visitors, digest, and workspace-access regression fixtures now reflect current backend behavior.
- Shared public app URL helpers now default generated widget snippets and app links to `https://usechatting.com` instead of localhost when `NEXT_PUBLIC_APP_URL` is unset.
- The root Next.js proxy now returns `404` for common WordPress probe paths like `xmlrpc.php`, `wp-login.php`, and `*/wp-includes/wlwmanifest.xml` so bot noise is cheaper to absorb.
- Cloud Run deployment now builds from standalone Next.js output, ships through repo Docker/Cloud Build config, and suppresses duplicate startup scheduler windows with shared DB claims plus advisory locks.
- Postgres server packaging now uses a traceable `pg` import plus a postbuild trace verification step so Vercel deploys fail fast if Next.js stops tracing the database driver into server output.
- Conversation-template emails now keep failed deliveries for automatic retry, surface queued retry state back to the dashboard, and run through scheduler-backed resend jobs with distributed locks.
- Stripe-backed billing flows for checkout, portal access, invoice sync, and webhook handling.
- Growth billing now runs from a shared seat-pricing config, validates Stripe's tiered Growth price shape before checkout, and prefers `STRIPE_DEV_*` billing credentials and price ids outside production.
- Billing price resolution now relies only on the current Growth Stripe price ids.
- Scheduled daily digests and weekly performance reports now use teammate-local report windows with timezone fallback before sending from the node runtime.
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

- Digital marketing docs now include first-pass TikTok ICP notes for founder-led SaaS, e-commerce, and agency video concepts tied to Chatting's core positioning.
- Repo agent instructions now require commit approval to show exact changelog entry edits up front instead of mentioning changelog work only at a summary level.
- The Reddit reply generator now includes clearer automod-safety rules for subreddits where direct links, domains, or service mentions are likely to trigger removals.
- Repo agent instructions now require a follow-up `npm run build` after any user-requested test run so verification stays consistent across tasks.
- Added a guide writing standard for public docs so future guide pages follow the same setup-first structure, verification flow, and copy rules.
- Digital marketing docs now include stronger source-abstraction rules for Chatting SEO prompts so forum-sourced article ideas get rewritten around the real buyer problem instead of the literal source framing.
- Blog contributor tooling now generates the published blog-post registry from `src/lib/blog-post-*.ts` files during `dev` and `build`, keeping route and sitemap registration in sync without hand-editing imports.
- Repo agent guidance, product context, and design-system reference docs live alongside the codebase.
- Changelog guidance now explicitly requires customer-facing product language instead of internal engineering notes or filler.
- The public changelog now folds small follow-up routing and email fixes into the main feature entries instead of publishing weak standalone notes.
- Digital marketing docs now include a reusable SEO blog prompt library covering master, comparison, how-to, and Reddit-thread conversion prompts.
- The SEO prompt library now explicitly forbids neutral first drafts and requires Chatting-first copy from the first pass.
- The root TypeScript config now includes Vitest globals so colocated route and component tests type-check cleanly during `next build`.
- Email sender and subdomain reference docs live in [CHATTING_EMAIL_ADDRESSES.md](./CHATTING_EMAIL_ADDRESSES.md).
- Production builds now stay type-safe across widget offline copy settings, conversation-template retry helpers, mail-from sender helpers, and shared scheduler test utilities.
- Next.js config now follows the default Turbopack dev/build path, and the concerns log tracks the remaining `metadataBase` and Edge-runtime build warnings.
- Contributor guidance now avoids the legacy `chatly-script` app-shell filename and no longer tracks the removed `sendRichEmail` concern as a live issue.
- Contributor docs now include a refreshed concerns log, growth strategy notes, TODO tracking, and Chatting-branded OG image guidance/templates.
- Product docs, service labels, and pricing-driven blog copy now use the Chatting brand consistently.
- The social content generator now enforces lowercase output, `https://usechatting.com`, and Chatting-first branding.
- The app now includes an internal Chatting distribution playbook markdown file for channel planning and launch messaging.
- Env definitions and runtime guards now keep node-only startup and service config isolated from client bundles.
- The example env file now documents the MiniMax API settings used by the response-tone checker service.

## Ops Note

- The application is deployed via Google Cloud Run.
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
