"use client";

import { useEffect, useState } from "react";
import {
  activateZapierIntegrationState,
  disconnectZapierIntegrationState
} from "./dashboard-integrations-zapier-api";
import {
  disconnectShopifyIntegrationState,
  loadShopifyIntegrationState
} from "./dashboard-integrations-shopify-api";
import {
  loadStoredDashboardIntegrationsState,
  persistDashboardIntegrationsState
} from "./dashboard-integrations-local-state";
import { loadRemoteDashboardIntegrationsState } from "./dashboard-integrations-remote-state";
import {
  disconnectSlackIntegrationState,
  saveSlackIntegrationState
} from "./dashboard-integrations-slack-api";
import { trackDashboardEvent } from "./dashboard-track-event";
import {
  DEFAULT_INTEGRATIONS_STATE,
  type DashboardIntegrationsState,
  type SaveWebhookInput,
  type SlackIntegrationState
} from "./dashboard-integrations-types";
import {
  applyWebhookTestResult,
  buildWebhookTestResult,
  createConnectedSlackState,
  type WebhookTestResult,
  upsertWebhook
} from "./dashboard-integrations-state-utils";

export function useDashboardIntegrationsState() {
  const [state, setState] = useState<DashboardIntegrationsState>(DEFAULT_INTEGRATIONS_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const nextState = loadStoredDashboardIntegrationsState();
      const remoteState = await loadRemoteDashboardIntegrationsState(nextState);
      if (!cancelled) {
        setState(remoteState);
        setHydrated(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    persistDashboardIntegrationsState(state);
  }, [hydrated, state]);

  async function persistSlack(nextSlack: SlackIntegrationState) {
    const slack = await saveSlackIntegrationState(createConnectedSlackState(nextSlack));
    setState((current) => ({ ...current, slack }));
    return slack;
  }

  async function saveSlack(nextSlack: SlackIntegrationState) {
    const slack = await persistSlack(nextSlack);
    trackDashboardEvent("integration.slack.connected");
    return slack;
  }

  async function updateSlack(nextSlack: SlackIntegrationState) {
    return persistSlack(nextSlack);
  }

  async function disconnectSlack() {
    const slack = await disconnectSlackIntegrationState();
    setState((current) => ({ ...current, slack }));
    trackDashboardEvent("integration.slack.disconnected");
    return slack;
  }

  function setSlackError(message: string) {
    setState((current) => ({ ...current, slack: { ...current.slack, status: "error", errorMessage: message } }));
  }

  function markSlackReconnect(message = "Connection lost") {
    setState((current) => ({ ...current, slack: { ...current.slack, status: "reconnect", errorMessage: message } }));
  }

  async function activateZapier(trackEvent = true) {
    const zapier = await activateZapierIntegrationState();
    setState((current) => ({ ...current, zapier }));
    if (trackEvent) {
      trackDashboardEvent("integration.zapier.connected");
    }
    return zapier;
  }

  async function disconnectZapier() {
    const zapier = await disconnectZapierIntegrationState();
    setState((current) => ({ ...current, zapier }));
    return zapier;
  }

  async function connectShopify() {
    const shopify = await loadShopifyIntegrationState();
    setState((current) => ({ ...current, shopify }));
    trackDashboardEvent("integration.shopify.connected");
    return shopify;
  }

  async function disconnectShopify() {
    const shopify = await disconnectShopifyIntegrationState();
    setState((current) => ({ ...current, shopify }));
    trackDashboardEvent("integration.shopify.disconnected");
    return shopify;
  }

  function setShopifyError(message: string) {
    setState((current) => ({
      ...current,
      shopify: { ...current.shopify, status: "error", errorMessage: message }
    }));
  }

  function saveWebhook(input: SaveWebhookInput) {
    let created = false;

    setState((current) => {
      const nextState = upsertWebhook(current.webhooks, input);
      created = nextState.created;
      return {
        ...current,
        webhooks: nextState.webhooks
      };
    });

    if (created) {
      trackDashboardEvent("integration.webhook.created");
    }
  }

  function deleteWebhook(id: string) {
    setState((current) => ({ ...current, webhooks: current.webhooks.filter((endpoint) => endpoint.id !== id) }));
    trackDashboardEvent("integration.webhook.deleted");
  }

  function testWebhook(id: string) {
    let result: WebhookTestResult = {
      tone: "success",
      title: "Test successful",
      message: "Received 200 OK in 234ms",
      responseBody: null
    };

    setState((current) => ({
      ...current,
      webhooks: current.webhooks.map((endpoint) => {
        if (endpoint.id !== id) {
          return endpoint;
        }

        result = buildWebhookTestResult(endpoint.url);
        return applyWebhookTestResult(endpoint, result);
      })
    }));

    trackDashboardEvent("integration.webhook.tested");
    return result;
  }

  return {
    state,
    hydrated,
    saveSlack,
    updateSlack,
    disconnectSlack,
    setSlackError,
    markSlackReconnect,
    activateZapier,
    disconnectZapier,
    connectShopify,
    disconnectShopify,
    setShopifyError,
    saveWebhook,
    deleteWebhook,
    testWebhook
  };
}
