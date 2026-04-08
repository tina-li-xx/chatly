import type { ZapierIntegrationState } from "./dashboard-integrations-types";
import { createIntegrationRouteReader } from "./dashboard-integrations-api";

const zapierRoute = createIntegrationRouteReader<ZapierIntegrationState, "zapier">(
  "/dashboard/settings/integrations/zapier",
  "zapier"
);

export const loadZapierIntegrationState = zapierRoute.load;
export const activateZapierIntegrationState = zapierRoute.post;
export const disconnectZapierIntegrationState = zapierRoute.remove;
