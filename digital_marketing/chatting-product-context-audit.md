# Chatting Product Context Audit

Purpose: trace the claims in `chatting-product-context.md` back to app code so the marketing context stays source-backed.

Last audited: 2026-04-05

## Verified Product Coverage

### Widget customization, offline copy, and placement

Status: verified

Sources:
- `src/lib/widget-settings.ts`
- `app/dashboard/dashboard-widget-settings-appearance-panel.tsx`
- `app/dashboard/dashboard-widget-settings-behavior-panel.tsx`
- `app/dashboard/sites/update/route.ts`
- `src/lib/data/sites-widget.ts`

What this covers:
- brand color
- team name and welcome message
- launcher position
- avatar style and team photo
- offline and away copy
- operating hours
- proactive prompt persistence, auto-open behavior, and gating

### Real-time conversation flow

Status: verified

Sources:
- `app/api/public/messages/route.ts`
- `app/api/public/typing/route.ts`
- `app/api/public/conversation-live/route.ts`
- `app/dashboard/typing/route.ts`
- `app/dashboard/reply/route.ts`
- `app/conversation/[token]/conversation-resume-client.tsx`

What this covers:
- visitor message creation
- team replies
- typing indicators for both sides
- SSE live updates
- attachment sending
- conversation resume

### Shared inbox features

Status: verified

Sources:
- `app/dashboard/assignment/route.ts`
- `app/dashboard/tags/route.ts`
- `app/dashboard/visitor-note/route.ts`
- `app/dashboard/saved-replies/route.ts`
- `app/dashboard/ai-assist/route.ts`
- `app/dashboard/dashboard-thread-detail-composer.tsx`
- `app/dashboard/dashboard-saved-replies-picker.tsx`
- `app/dashboard/dashboard-visitor-note-editor.tsx`
- `app/dashboard/dashboard-ai-assist-panel.tsx`
- `app/api/email/inbound/route.ts`

What this covers:
- assignments
- tags
- shared visitor notes
- saved replies
- AI assist
- reply-by-email continuation through inbound email replies

### Visitors workspace and live presence

Status: verified

Sources:
- `app/api/public/site-config/route.ts`
- `src/lib/repositories/visitor-presence-repository.ts`
- `src/lib/data/visitors.ts`
- `app/dashboard/visitors-data.ts`
- `app/dashboard/dashboard-visitors-page-drawer.tsx`
- `src/lib/notification-utils.ts`

What this covers:
- live visitor presence sessions
- current page and referrer capture
- location, browser, and timezone context
- page history and conversation history
- high-intent page detection

### Analytics dashboard

Status: verified

Sources:
- `app/dashboard/dashboard-analytics-page.tsx`

What this covers:
- conversation trends
- response time and resolution time
- heat map and busiest periods
- top pages
- rating breakdown
- tag breakdown
- team performance
- export

### Help center

Status: verified

Sources:
- `app/dashboard/dashboard-help-center-manager.tsx`
- `app/help/[siteId]/page.tsx`
- `app/help/[siteId]/[slug]/page.tsx`

What this covers:
- publishing help-center articles
- per-site public help-center index
- per-site public article pages
- copying public links for chat replies

### Automation settings and live widget behavior

Status: verified with plan nuances

Sources:
- `app/dashboard/dashboard-settings-automation-section.tsx`
- `app/dashboard/dashboard-settings-automation-routing-section.tsx`
- `app/dashboard/dashboard-settings-automation-speed-section.tsx`
- `app/dashboard/dashboard-settings-automation-proactive-section.tsx`
- `app/dashboard/dashboard-settings-automation-options.ts`
- `app/api/public/messages/route.ts`
- `app/api/public/conversation/route.ts`

What this covers:
- automation settings for offline behavior
- auto-assign and auto-tag routing rules
- faq suggestions shown before connecting to the team
- proactive prompts with delay and auto-open behavior
- live widget automation payloads running against real visitor sessions

Plan nuance:
- starter supports routing and proactive prompts with a one-rule or one-prompt limit
- growth removes those starter limits
- faq suggestions are growth-only in the current settings UI

## Pricing And Plan Enforcement

### Starter plan

Status: verified

Sources:
- `src/lib/billing-plans.ts`
- `src/lib/freemium.ts`
- `src/lib/data/billing.ts`

Verified claims:
- free
- 50 conversations per month
- 1 team member
- widget customization
- email notifications

### Growth plan

Status: verified with corrections

Sources:
- `src/lib/billing-plans.ts`
- `src/lib/growth-pricing-config.json`
- `src/lib/pricing-model.ts`
- `src/lib/data/billing.ts`
- `app/dashboard/sites/update/route.ts`
- `src/lib/data/sites-widget.ts`
- `app/conversation/conversation-thread-nav.tsx`
- `app/dashboard/dashboard-settings-automation-options.ts`
- `app/dashboard/dashboard-settings-automation-speed-section.tsx`
- `app/dashboard/dashboard-settings-automation-routing-section.tsx`
- `app/dashboard/dashboard-settings-automation-proactive-section.tsx`

Verified claims:
- starts at $20/month
- includes up to 3 team members before extra member tiers
- unlimited conversations
- faq suggestions
- removes the starter one-rule limit on routing
- removes the starter one-prompt limit on proactive prompts
- branding removal for a white-label widget presentation
- volume pricing starts at $6/member/month after the first 3 teammates

Not safe as Growth-only claims from the code trace:
- visitor tracking
- advanced analytics
- AI assist
- saved replies
- API access

Reason:
- those claims appear in pricing and upgrade copy, but this audit did not find matching plan gates for the first four or a shipped customer-facing API product for the last one

## Removed Or Corrected Claims

### API access on Growth

Status: removed from canonical marketing context

Sources checked:
- `src/lib/billing-plans.ts`
- `app/landing-page-pricing-section.tsx`
- `app/dashboard/dashboard-billing-utils.ts`
- `src/lib/data/dashboard-growth-expansion.ts`

Reason:
- found pricing-copy references, but not a customer-facing API product surface that should be marketed

### Custom branding and white-label widget on Growth

Status: corrected

Sources:
- `src/lib/widget-settings.ts`
- `app/dashboard/dashboard-widget-settings-appearance-panel.tsx`
- `src/lib/data/sites-widget.ts`
- `app/conversation/conversation-thread-nav.tsx`

Reason:
- widget customization exists on Starter already
- the Growth-specific behavior this audit could verify is Chatting branding removal, not basic customization

## Repo Mismatches Still Worth Knowing

These files still market broader Growth-only perks than this audit could prove:

- `src/lib/billing-plans.ts`
- `app/landing-page-pricing-section.tsx`
- `app/dashboard/dashboard-billing-utils.ts`

Treat those files as current pricing copy, not as evidence for source-backed product claims, until the product or gating logic catches up.

No remaining setup-speed mismatch is tracked in the main landing or shared signup surfaces after the founder-approved `3 minutes` wording update.
