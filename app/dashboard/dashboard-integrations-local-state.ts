import {
  DEFAULT_INTEGRATIONS_STATE,
  type DashboardIntegrationsState
} from "./dashboard-integrations-types";
import { sanitizeIntegrationsState } from "./dashboard-integrations-state-utils";

const STORAGE_KEY = "chatly.dashboard.integrations";

export function loadStoredDashboardIntegrationsState() {
  if (typeof window === "undefined") {
    return DEFAULT_INTEGRATIONS_STATE;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return DEFAULT_INTEGRATIONS_STATE;
    }

    const localState = sanitizeIntegrationsState(JSON.parse(saved));
    return {
      ...localState,
      slack: DEFAULT_INTEGRATIONS_STATE.slack,
      zapier: DEFAULT_INTEGRATIONS_STATE.zapier,
      shopify: DEFAULT_INTEGRATIONS_STATE.shopify
    };
  } catch {
    return DEFAULT_INTEGRATIONS_STATE;
  }
}

export function persistDashboardIntegrationsState(
  state: DashboardIntegrationsState
) {
  if (typeof window === "undefined") {
    return;
  }

  const { slack: _slack, zapier: _zapier, shopify: _shopify, ...localState } = state;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
}
