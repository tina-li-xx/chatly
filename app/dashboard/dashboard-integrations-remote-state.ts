import type { DashboardIntegrationsState } from "./dashboard-integrations-types";
import { sanitizeIntegrationsState } from "./dashboard-integrations-state-utils";
import { loadShopifyIntegrationState } from "./dashboard-integrations-shopify-api";
import { loadSlackIntegrationState } from "./dashboard-integrations-slack-api";
import { loadZapierIntegrationState } from "./dashboard-integrations-zapier-api";

export async function loadRemoteDashboardIntegrationsState(
  nextState: DashboardIntegrationsState
) {
  const [slackResult, zapierResult, shopifyResult] = await Promise.allSettled([
    loadSlackIntegrationState(),
    loadZapierIntegrationState(),
    loadShopifyIntegrationState()
  ]);

  return sanitizeIntegrationsState({
    ...nextState,
    slack:
      slackResult.status === "fulfilled" ? slackResult.value : nextState.slack,
    zapier:
      zapierResult.status === "fulfilled"
        ? zapierResult.value
        : nextState.zapier,
    shopify:
      shopifyResult.status === "fulfilled"
        ? shopifyResult.value
        : nextState.shopify
  });
}
