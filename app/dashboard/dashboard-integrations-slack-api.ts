import type { SlackIntegrationState } from "./dashboard-integrations-types";
import { createIntegrationRouteReader } from "./dashboard-integrations-api";

const slackRoute = createIntegrationRouteReader<SlackIntegrationState, "slack">(
  "/dashboard/settings/integrations/slack",
  "slack"
);

export const loadSlackIntegrationState = slackRoute.load;

export async function saveSlackIntegrationState(state: SlackIntegrationState) {
  return slackRoute.post(JSON.stringify(state));
}

export const disconnectSlackIntegrationState = slackRoute.remove;
