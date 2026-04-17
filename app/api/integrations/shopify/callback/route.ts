import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { INTEGRATION_OAUTH_MESSAGE_TYPE } from "@/lib/browser-event-contracts";
import {
  integrationPopupErrorResponse,
  integrationPopupSuccessResponse
} from "@/lib/integration-popup-response";
import {
  findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow
} from "@/lib/services/integrations";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import {
  exchangeShopifyOAuthCode,
  getShopifyOAuthCookieOptions,
  normalizeShopifyShopDomain,
  parseShopifyOAuthStateCookie,
  SHOPIFY_OAUTH_STATE_COOKIE,
  verifyShopifyOAuthQuery
} from "@/lib/shopify-integration";
import {
  buildShopifyIntegrationState,
  serializeShopifyIntegrationCredentials,
  serializeShopifyIntegrationSettings
} from "@/lib/shopify-integration-state";
import { getWorkspaceAccess } from "@/lib/workspace-access";

async function handleGET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const shop = normalizeShopifyShopDomain(url.searchParams.get("shop"));
  const cookieStore = await cookies();
  const stored = parseShopifyOAuthStateCookie(
    cookieStore.get(SHOPIFY_OAUTH_STATE_COOKIE)?.value
  );
  cookieStore.set(SHOPIFY_OAUTH_STATE_COOKIE, "", {
    ...getShopifyOAuthCookieOptions(),
    maxAge: 0
  });

  if (
    !code ||
    !state ||
    !shop ||
    !stored ||
    stored.state !== state ||
    stored.shop !== shop ||
    !verifyShopifyOAuthQuery(url)
  ) {
    return integrationPopupErrorResponse(
      "Shopify OAuth state verification failed. Please try again.",
      "shopify"
    );
  }

  const user = await getCurrentUser();
  if (!user || user.workspaceRole === "member") {
    return integrationPopupErrorResponse(
      "You no longer have access to connect Shopify for this workspace.",
      "shopify"
    );
  }

  try {
    const workspace = await getWorkspaceAccess(user.id, stored.ownerUserId);
    const oauth = await exchangeShopifyOAuthCode(shop, code);
    const existing = await findWorkspaceIntegrationRow(
      workspace.ownerUserId,
      "shopify"
    );
    const nextState = buildShopifyIntegrationState(existing);
    const timestamp = new Date().toISOString();

    await upsertWorkspaceIntegrationRow({
      ownerUserId: workspace.ownerUserId,
      provider: "shopify",
      status: "connected",
      accountLabel: shop,
      externalAccountId: shop,
      settingsJson: serializeShopifyIntegrationSettings(shop),
      credentialsJson: serializeShopifyIntegrationCredentials({
        accessToken: oauth.accessToken,
        scopes: oauth.scopes
      }),
      errorMessage: null,
      connectedAt: existing?.connected_at ?? timestamp,
      lastValidatedAt: timestamp
    });

    return integrationPopupSuccessResponse({
      type: INTEGRATION_OAUTH_MESSAGE_TYPE,
      provider: "shopify",
      outcome: "success",
      domain: shop
    });
  } catch {
    return integrationPopupErrorResponse(
      "We couldn't finish connecting Shopify. Please try again.",
      "shopify"
    );
  }
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/integrations/shopify/callback/route.ts:GET"
);
