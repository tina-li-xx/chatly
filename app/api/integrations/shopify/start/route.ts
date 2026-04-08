import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { integrationPopupErrorResponse } from "@/lib/integration-popup-response";
import { redirect303 } from "@/lib/route-helpers";
import {
  buildShopifyAuthorizeUrl,
  getShopifyOAuthCookieOptions,
  normalizeShopifyShopDomain,
  serializeShopifyOAuthStateCookie,
  SHOPIFY_OAUTH_STATE_COOKIE
} from "@/lib/shopify-integration";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect303(request, "/login");
  }
  if (user.workspaceRole === "member") {
    return integrationPopupErrorResponse(
      "Only workspace admins can connect Shopify.",
      "shopify"
    );
  }

  const shop = normalizeShopifyShopDomain(
    new URL(request.url).searchParams.get("shop")
  );
  if (!shop) {
    return integrationPopupErrorResponse(
      "Enter a valid Shopify store before connecting.",
      "shopify"
    );
  }

  try {
    const state = randomBytes(16).toString("hex");
    (await cookies()).set(
      SHOPIFY_OAUTH_STATE_COOKIE,
      serializeShopifyOAuthStateCookie({
        state,
        ownerUserId: user.workspaceOwnerId,
        shop
      }),
      getShopifyOAuthCookieOptions()
    );
    return Response.redirect(buildShopifyAuthorizeUrl(shop, state), 302);
  } catch {
    return integrationPopupErrorResponse(
      "Shopify isn't configured in this environment yet.",
      "shopify"
    );
  }
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/integrations/shopify/start/route.ts:GET"
);
