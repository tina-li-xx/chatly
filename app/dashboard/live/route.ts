import type { DashboardLiveEvent } from "@/lib/live-events";
import { subscribeDashboardLive } from "@/lib/live-events";
import { hasConversationAccess } from "@/lib/services/live";
import { requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  };
}

function readConversationId(event: DashboardLiveEvent) {
  return "conversationId" in event ? event.conversationId ?? null : null;
}

async function handleGET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (event: unknown) => {
        if (closed) {
          return;
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const sendIfAllowed = async (event: DashboardLiveEvent) => {
        const conversationId = readConversationId(event);

        if (
          auth.user.workspaceRole !== "member" ||
          !conversationId ||
          (await hasConversationAccess(conversationId, auth.user.workspaceOwnerId, auth.user.id))
        ) {
          send(event);
        }
      };

      send({ type: "connected" });

      const unsubscribe = subscribeDashboardLive(auth.user.workspaceOwnerId, (event) => {
        void sendIfAllowed(event).catch((error) => {
          console.error("dashboard live event access filter failed", error);
        });
      });

      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
      }, 20000);

      request.signal.addEventListener(
        "abort",
        () => {
          closed = true;
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

export const GET = withRouteErrorAlerting(handleGET, "app/dashboard/live/route.ts:GET");
