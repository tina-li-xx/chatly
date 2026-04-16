import type { BlogSection } from "@/lib/blog-types";
import { code, cta, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingApiReferenceGuideSections: BlogSection[] = [
  section("scope", "Supported API surface", [
    paragraph(
      "Chatting does not currently expose a separate general-purpose public developer API beyond the Zapier integration endpoints. The supported external integration surface is the `/api/zapier/*` family documented below and in the dedicated Zapier API reference."
    ),
    list([
      "Supported partner/developer API: `/api/zapier/*`",
      "First-party widget/browser routes: `/api/public/*`",
      "First-party authenticated dashboard routes: `/api/contacts/*`, `/api/files/*`",
      "Browser and dashboard routes are product interfaces, not a standalone third-party developer API"
    ])
  ]),
  section("zapier", "Zapier integration endpoints", [
    paragraph(
      "These are the only supported endpoints used by the published Zapier integration."
    ),
    code(
      [
        "GET    /api/zapier/me",
        "GET    /api/zapier/conversations?limit=1",
        "GET    /api/zapier/conversations?limit=1&event=conversation.resolved",
        "GET    /api/zapier/conversations?limit=1&event=tag.added",
        "GET    /api/zapier/contacts?limit=1",
        "POST   /api/zapier/webhooks/subscribe",
        "DELETE /api/zapier/webhooks/{id}",
        "POST   /api/zapier/contacts",
        "POST   /api/zapier/contacts/{id}/tags",
        "POST   /api/zapier/conversations/{id}/messages"
      ].join("\n"),
      "http"
    ),
    cta(
      "Need the endpoint-level request and response details?",
      "Use the dedicated Zapier API reference for auth headers, payloads, sample responses, and error codes.",
      "Open Zapier API reference",
      "/guides/chatting-zapier-api-reference"
    )
  ]),
  section("widget-browser", "First-party widget and browser routes", [
    paragraph(
      "The routes below power Chatting's own website widget, visitor resume flow, newsletter tools, and browser/device features. They are first-party product routes rather than a standalone partner API."
    ),
    code(
      [
        "GET    /api/public/site-config",
        "GET    /api/public/site-status",
        "GET    /api/public/conversation",
        "GET    /api/public/conversation-live",
        "GET    /api/public/conversation-status",
        "POST   /api/public/messages",
        "POST   /api/public/typing",
        "POST   /api/public/identify",
        "POST   /api/public/conversation-email",
        "POST   /api/public/faq-handoff",
        "POST   /api/public/email/unsubscribe",
        "POST   /api/public/newsletter",
        "POST   /api/public/newsletter/preferences",
        "POST   /api/public/free-tool-export",
        "POST   /api/public/response-tone-checker",
        "POST   /api/public/mobile-device",
        "DELETE /api/public/mobile-device"
      ].join("\n"),
      "http"
    ),
    list([
      "`site-config` and `site-status` bootstrap the widget session",
      "`conversation`, `conversation-live`, and `conversation-status` resume or stream a visitor conversation",
      "`messages`, `typing`, and `identify` handle live widget activity",
      "The remaining routes support email preferences, FAQ handoff, newsletter flows, free tools, and mobile-device registration"
    ])
  ]),
  section("dashboard", "Authenticated dashboard routes", [
    paragraph(
      "These routes are used by Chatting's own authenticated dashboard UI. They are not part of the Zapier integration and are not positioned as a separate public developer API."
    ),
    code(
      [
        "GET    /api/contacts",
        "POST   /api/contacts",
        "GET    /api/contacts/{id}",
        "PATCH  /api/contacts/{id}",
        "DELETE /api/contacts/{id}",
        "GET    /api/contacts/{id}/conversations",
        "POST   /api/contacts/bulk",
        "PATCH  /api/contacts/settings",
        "GET    /api/files/{attachmentId}"
      ].join("\n"),
      "http"
    ),
    paragraph(
      "Zapier reviewers and support should treat the `/api/zapier/*` family as the supported integration API. The browser and dashboard routes above are documented here for completeness, but they are part of Chatting's first-party product runtime rather than a separate external developer platform."
    )
  ])
];
