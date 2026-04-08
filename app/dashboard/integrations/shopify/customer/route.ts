import { getInboxConversationSummaryById } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import {
  findWorkspaceIntegrationRow
} from "@/lib/repositories/integrations-repository";
import { fetchShopifyCustomerContext } from "@/lib/shopify-customer-context";
import {
  buildShopifyIntegrationState,
  readShopifyAccessToken
} from "@/lib/shopify-integration-state";

async function handleGET(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) {
    return jsonError("conversation-id-required", 400);
  }

  const conversation = await getInboxConversationSummaryById(
    conversationId,
    auth.user.id
  );
  if (!conversation) {
    return jsonError("conversation-not-found", 404);
  }
  if (!conversation.email) {
    return jsonOk({ customer: null });
  }

  const row = await findWorkspaceIntegrationRow(
    auth.user.workspaceOwnerId,
    "shopify"
  );
  const accessToken = readShopifyAccessToken(row);
  const domain = buildShopifyIntegrationState(row).domain;
  if (!accessToken || !domain) {
    return jsonOk({ customer: null });
  }

  try {
    return jsonOk({
      customer: await fetchShopifyCustomerContext({
        accessToken,
        domain,
        email: conversation.email
      })
    });
  } catch {
    return jsonError("shopify-customer-context-failed", 500);
  }
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/dashboard/integrations/shopify/customer/route.ts:GET"
);
