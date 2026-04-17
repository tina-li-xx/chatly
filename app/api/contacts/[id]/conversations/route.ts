import { getDashboardContactConversations } from "@/lib/services";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const conversations = await getDashboardContactConversations(auth.user.id, id);
  if (!conversations) {
    return jsonError("contact-not-found", 404);
  }

  return jsonOk({ conversations });
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/contacts/[id]/conversations/route.ts:GET");
