import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { verifySlackRequestSignature } from "@/lib/slack-request-signing";
import { handleSlackThreadReplyEvent } from "@/lib/slack-thread-replies";

type SlackUrlVerificationPayload = {
  type?: string;
  challenge?: string;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

async function handlePOST(request: Request) {
  const body = await request.text();
  const verified = verifySlackRequestSignature(request.headers, body);
  if (!verified.ok) {
    return json({ ok: false, error: verified.error }, verified.status);
  }

  let payload: SlackUrlVerificationPayload;
  try {
    payload = JSON.parse(body) as SlackUrlVerificationPayload;
  } catch {
    return json({ ok: false, error: "invalid-slack-payload" }, 400);
  }

  if (payload.type === "url_verification" && typeof payload.challenge === "string") {
    return json({ challenge: payload.challenge });
  }

  return json(await handleSlackThreadReplyEvent(payload));
}

export const POST = withRouteErrorAlerting(handlePOST, "app/api/integrations/slack/events/route.ts:POST");
