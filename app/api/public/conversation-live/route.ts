import { getPublicConversationMessages } from "@/lib/data";
import { subscribeConversationLive } from "@/lib/live-events";
import { publicNoContentResponse } from "@/lib/public-api";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function handleOPTIONS() {
  return publicNoContentResponse();
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  };
}

async function handleGET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = String(searchParams.get("siteId") ?? "").trim();
  const sessionId = String(searchParams.get("sessionId") ?? "").trim();
  const conversationId = String(searchParams.get("conversationId") ?? "").trim();

  if (!siteId || !sessionId || !conversationId) {
    return new Response("Missing conversation identity.", { status: 400, headers: sseHeaders() });
  }

  const messages = await getPublicConversationMessages({ siteId, sessionId, conversationId });
  if (!messages) {
    return new Response("Conversation not found.", { status: 404, headers: sseHeaders() });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      send({ type: "connected", conversationId });

      const unsubscribe = subscribeConversationLive(conversationId, (event) => {
        send(event);
      });

      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
      }, 20000);

      request.signal.addEventListener(
        "abort",
        () => {
          clearInterval(ping);
          unsubscribe();
          controller.close();
        },
        { once: true }
      );
    }
  });

  return new Response(stream, { headers: sseHeaders() });
}

export const OPTIONS = withRouteErrorAlerting(handleOPTIONS, "app/api/public/conversation-live/route.ts:OPTIONS");
export const GET = withRouteErrorAlerting(handleGET, "app/api/public/conversation-live/route.ts:GET");
