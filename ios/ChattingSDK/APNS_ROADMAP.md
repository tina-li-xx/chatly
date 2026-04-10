# Chatting iOS Push Delivery Roadmap

This roadmap is now mostly implemented in the codebase. Keep it as a follow-up checklist for deeper APNs polish, not as a statement that native iOS push is still missing entirely.

This file is maintainer-facing. It is for people working on Chatting itself, not for app developers integrating the SDK into their own iOS app. Integrators should use `ios/ChattingSDK/README.md` and the public iOS SDK guide instead.

## Chatting Operator Checklist

If you run Chatting itself, your operational setup is only:

- set `APPLE_TEAM_ID` in the Chatting deployment
- set `APPLE_KEY_ID` in the Chatting deployment
- set `APPLE_PUSH_KEY_P8` in the Chatting deployment

Anything about Xcode capabilities, notification permission prompts, APNs device tokens, or `registerPushToken(...)` belongs in the integrator-facing SDK docs, not in your Chatting operator checklist.

## Goal

Ship iOS push notifications and reliable conversation refresh when the host app returns from the background, using the existing public Chatting conversation APIs plus a new APNs delivery path.

## What We Are Solving

This roadmap was written for the missing pieces that had to be added around native iOS push and lifecycle refresh. Those core pieces now exist. Keep the list below as the scope this roadmap was meant to cover.

The iOS SDK now supports:

- session storage
- site config and site status reads
- create/resume conversation
- identify and email capture
- typing updates
- live SSE updates while the app is active
- push notifications for new team replies
- background delivery while the app is suspended
- device token registration
- reconnect/resync behavior tied to app lifecycle transitions

Important constraint:

iOS cannot keep an SSE connection alive while the app is suspended. Background message delivery therefore requires APNs. The right model is:

- foreground: use SSE for instant updates
- background/suspended: use APNs
- on foreground return: refetch conversation state and resume SSE

## Recommended Architecture

Use direct APNs, not Firebase/FCM.

Why:

- fewer moving parts
- no extra vendor dependency
- better fit for a first-party SDK
- simpler operational model for a single iOS delivery channel

High-level flow:

1. The host app requests push permission and obtains an APNs device token.
2. The SDK sends that token to Chatting for the current visitor session and conversation.
3. When a team reply is created, Chatting stores the message normally, publishes live events normally, and also queues an APNs notification for matching visitor devices.
4. If the app is active, SSE delivers the message immediately.
5. If the app is backgrounded or suspended, APNs delivers the notification.
6. When the app opens or becomes active again, the SDK refreshes the conversation and resumes SSE.

## Phase 1: Backend Foundations

### 1. Add device registration storage

Create a table for visitor mobile push registrations.

Suggested columns:

- `id`
- `site_id`
- `conversation_id` nullable
- `session_id`
- `platform` fixed to `ios`
- `bundle_id`
- `environment` (`sandbox` or `production`)
- `device_token`
- `last_seen_at`
- `disabled_at` nullable
- `created_at`
- `updated_at`

Rules:

- allow multiple tokens per session
- deduplicate on `device_token + bundle_id + environment`
- keep registration valid even before a conversation exists
- attach to a conversation once the visitor starts chatting

### 2. Add APNs env configuration

Add required server env values for APNs:

- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PUSH_KEY_P8`

Bundle ID and environment are supplied by the integrating app when it registers its APNs token. If multi-app support needs deeper per-customer isolation later, move APNs credentials out of global env vars and into per-site or per-sdk config.

### 3. Add APNs delivery service

Create a small server-side APNs client responsible for:

- generating JWT auth tokens from the `.p8` key
- choosing sandbox vs production APNs host
- posting JSON payloads to APNs
- handling invalid token responses
- marking bad tokens disabled

Keep this separate from conversation write logic so message persistence is never blocked by APNs complexity.

### 4. Trigger pushes on team replies

When a team reply is created for a conversation, enqueue or dispatch APNs notifications to registered visitor devices for that conversation.

Push only for:

- team-authored messages
- open visitor-facing conversations
- active, non-disabled device registrations

Do not push for:

- visitor-authored messages
- typing events
- internal status changes

## Phase 2: Public API Additions

### 1. Register device token route

Add a new public route:

`POST /api/public/mobile-device`

Suggested body:

```json
{
  "siteId": "site_123",
  "sessionId": "session_123",
  "conversationId": "conv_123",
  "platform": "ios",
  "bundleId": "com.example.app",
  "environment": "sandbox",
  "deviceToken": "..."
}
```

Behavior:

- create or refresh the registration
- allow `conversationId` to be null
- update registration when the conversation becomes known later
- return `{ "ok": true }`

### 2. Unregister device token route

Add:

`DELETE /api/public/mobile-device`

Suggested body:

```json
{
  "siteId": "site_123",
  "sessionId": "session_123",
  "deviceToken": "..."
}
```

Behavior:

- soft-disable the registration
- keep history for diagnostics

### 3. Optional conversation binding route

If token registration happens before the conversation exists, the SDK can also rely on normal message-send flows to attach the registration later. Only add a dedicated binding route if the data layer becomes awkward without it.

## Phase 3: SDK Core Changes

### 1. Add push registration APIs

Extend `ChattingClient` with methods like:

- `registerPushToken(...)`
- `unregisterPushToken(...)`
- `syncPushTokenIfNeeded(...)`

Responsibilities:

- normalize token data
- send the correct bundle ID and environment
- associate the current session and conversation
- avoid duplicate network calls when nothing changed

### 2. Persist device registration state

Add lightweight local storage for:

- last registered token
- bundle ID
- environment
- last synced conversation ID

This lets the SDK avoid noisy re-registration every launch.

### 3. Refresh on lifecycle transitions

The SDK should expose helpers to be called from the host app when:

- the app becomes active
- a push is tapped
- a remote notification is received in foreground

Expected behavior:

- refetch the conversation if one exists
- clear stale typing state
- restart SSE if needed

### 4. Improve reconnect semantics

Current reconnect should become lifecycle-aware:

- active app: keep SSE running
- app resigns active/backgrounds: stop SSE cleanly
- app returns active: reload conversation and reconnect SSE

Do not attempt a permanent background socket. iOS will not make that reliable.

## Phase 4: SDK UI and Host-App Integration

### 1. Add notification integration docs

Document the host app steps:

- request `UNUserNotificationCenter` authorization
- register for remote notifications
- pass APNs token into `ChattingClient`
- forward app lifecycle events into the SDK
- handle push tap navigation into the conversation view

### 2. Add demo integration sample

Expand the demo scaffold to show:

- `AppDelegate` or SwiftUI app lifecycle hooks
- APNs token registration callback
- notification tap routing
- foreground refresh behavior

### 3. Add UI hooks for delivery state

Optional v1.1 improvements:

- show “reconnecting” state after foreground return
- show unread badge or new-reply marker after push tap
- clear badges after successful conversation refresh

## Phase 5: Notification Payload Design

Recommended APNs payload:

```json
{
  "aps": {
    "alert": {
      "title": "New reply",
      "body": "You have a new message"
    },
    "sound": "default",
    "badge": 1
  },
  "chatting": {
    "siteId": "site_123",
    "conversationId": "conv_123",
    "messageId": "msg_123",
    "eventType": "message.created"
  }
}
```

Rules:

- keep message body generic by default unless product explicitly wants message previews
- always include `conversationId`
- include enough metadata for deep-linking and refresh

## Phase 6: Reliability and Safety

### Delivery rules

- APNs failures must not fail message creation
- invalid tokens should be disabled automatically
- retries should be bounded
- delivery attempts should be logged with conversation and token identifiers

### Privacy rules

- do not include sensitive message content in the push payload by default
- keep previews configurable later if needed
- do not send pushes for archived or visitor-closed conversations unless product explicitly wants that

### Operational visibility

Add internal logging for:

- registration success/failure
- APNs acceptance/rejection
- invalid token cleanup
- push send counts per conversation

## Testing Plan

### Backend

- unit tests for registration create/update/disable logic
- route tests for register/unregister endpoints
- delivery tests proving team replies attempt APNs sends
- invalid token tests proving tokens are disabled on APNs rejection

### SDK

- unit tests for push token registration requests
- storage tests for deduped sync behavior
- lifecycle tests for background -> foreground resync
- notification payload handling tests for deep-link metadata parsing

### Manual verification

1. Launch the demo app and grant notification permission.
2. Register a device token against a visitor session.
3. Start a conversation from iOS.
4. Reply from the dashboard as a team member.
5. Confirm immediate SSE delivery while app is foregrounded.
6. Background or suspend the app.
7. Reply again from the dashboard.
8. Confirm APNs delivery.
9. Tap the notification and confirm the conversation refreshes and reconnects.

## Rollout Order

### Milestone 1

Backend-only foundation:

- migration
- registration data layer
- APNs client
- env validation

### Milestone 2

Public API:

- register route
- unregister route
- attach registrations to conversations

### Milestone 3

SDK core:

- register/unregister methods
- local token sync state
- lifecycle refresh helpers

### Milestone 4

Demo and docs:

- notification setup guide
- demo app lifecycle integration
- manual QA checklist

### Milestone 5

Polish:

- badge handling
- notification tap routing refinement
- richer delivery diagnostics

## Recommended First Slice

Build the smallest end-to-end slice in this order:

1. device registration table and route
2. APNs sender service
3. team-reply trigger path
4. `ChattingClient.registerPushToken`
5. demo app token registration
6. foreground-return conversation refresh

That gets us real push-backed delivery quickly without overbuilding the lifecycle layer first.

## Out of Scope for V1

- Android push delivery
- Firebase/FCM
- attachment preview pushes
- inline reply actions
- guaranteed silent background sync
- notification content extensions
- per-site custom push topics
