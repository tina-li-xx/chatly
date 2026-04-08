import type { ShopifyIntegrationState } from "./dashboard-integrations-types";
import { createIntegrationRouteReader } from "./dashboard-integrations-api";

const shopifyRoute = createIntegrationRouteReader<
  ShopifyIntegrationState,
  "shopify"
>("/dashboard/settings/integrations/shopify", "shopify");

export const loadShopifyIntegrationState = shopifyRoute.load;
export const disconnectShopifyIntegrationState = shopifyRoute.remove;
