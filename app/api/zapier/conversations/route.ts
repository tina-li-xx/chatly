import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { listZapierConversations } from "@/lib/zapier-api-resources";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";
import {
  buildZapierConversationCreatedPayload,
  buildZapierConversationResolvedPayload,
  buildZapierTagAddedPayload
} from "@/lib/zapier-event-payloads";

const OVERFETCHED_SAMPLE_EVENTS = new Set(["conversation.resolved", "tag.added"]);

function sampleResolvedDurationSeconds(createdAt: string, updatedAt: string) {
  return Math.max(
    0,
    Math.round(
      (new Date(updatedAt).getTime() - new Date(createdAt).getTime()) / 1000
    )
  );
}

function sampleLimitForEvent(limit: number, event: string | null) {
  return OVERFETCHED_SAMPLE_EVENTS.has(event ?? "")
    ? Math.max(limit * 10, 25)
    : limit;
}

function buildCreatedSamples(
  conversations: Awaited<ReturnType<typeof listZapierConversations>>,
  limit: number
) {
  return conversations.slice(0, limit).map((conversation) =>
    buildZapierConversationCreatedPayload({
      conversationId: conversation.id,
      visitorEmail: conversation.visitor_email,
      visitorName: null,
      pageUrl: conversation.page_url,
      firstMessage: conversation.last_message_preview ?? "",
      tags: conversation.tags,
      assignedTo: null,
      createdAt: conversation.created_at
    })
  );
}

function buildResolvedSamples(
  conversations: Awaited<ReturnType<typeof listZapierConversations>>,
  limit: number,
  ownerEmail: string
) {
  return conversations
    .filter((conversation) => conversation.status === "resolved")
    .slice(0, limit)
    .map((conversation) =>
      buildZapierConversationResolvedPayload({
        conversationId: conversation.id,
        visitorEmail: conversation.visitor_email,
        resolvedBy: ownerEmail,
        messageCount: 1,
        durationSeconds: sampleResolvedDurationSeconds(
          conversation.created_at,
          conversation.updated_at
        ),
        timestamp: conversation.updated_at
      })
    );
}

function buildTagSamples(
  conversations: Awaited<ReturnType<typeof listZapierConversations>>,
  limit: number,
  ownerEmail: string
) {
  return conversations
    .filter((conversation) => conversation.tags.length > 0)
    .slice(0, limit)
    .map((conversation) =>
      buildZapierTagAddedPayload({
        conversationId: conversation.id,
        tag: conversation.tags[0] ?? "follow-up",
        addedBy: ownerEmail,
        timestamp: conversation.updated_at
      })
    );
}

async function handleGET(request: Request) {
  const auth = await requireZapierApiAuth(request);
  if ("response" in auth) {
    return auth.response;
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const event = url.searchParams.get("event");
  const ownerEmail = auth.auth.ownerEmail || "team@chatting.test";
  const conversations = await listZapierConversations(
    auth.auth.ownerUserId,
    sampleLimitForEvent(limit, event)
  );
  if (event === "conversation.resolved") {
    return Response.json(buildResolvedSamples(conversations, limit, ownerEmail));
  }
  if (event === "tag.added") {
    return Response.json(buildTagSamples(conversations, limit, ownerEmail));
  }

  return Response.json(buildCreatedSamples(conversations, limit));
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/zapier/conversations/route.ts:GET"
);
