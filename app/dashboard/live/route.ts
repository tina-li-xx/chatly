import { subscribeDashboardLive } from "@/lib/live-events";
import { requireJsonRouteUser } from "@/lib/route-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  };
}

export async function GET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      send({ type: "connected" });

      const unsubscribe = subscribeDashboardLive(auth.user.id, (event) => {
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
