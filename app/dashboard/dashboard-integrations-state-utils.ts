import {
  DEFAULT_INTEGRATIONS_STATE,
  type DashboardIntegrationsState,
  type DashboardWebhookEndpoint,
  type SaveWebhookInput,
  type SlackIntegrationState,
  WEBHOOK_EVENT_OPTIONS
} from "./dashboard-integrations-types";

const VALID_EVENTS = new Set(WEBHOOK_EVENT_OPTIONS.map((option) => option.value));
const SLACK_RECONNECT_AFTER_MS = 1000 * 60 * 60 * 24;

export type WebhookTestResult = {
  tone: "success" | "error";
  title: string;
  message: string;
  responseBody: string | null;
};

function createWebhookId() {
  return `wh_${Math.random().toString(36).slice(2, 10)}`;
}

export function sanitizeWebhook(endpoint: Partial<DashboardWebhookEndpoint>): DashboardWebhookEndpoint {
  const events = Array.isArray(endpoint.events) ? endpoint.events.filter((event) => VALID_EVENTS.has(event)) : [];
  return {
    id: typeof endpoint.id === "string" && endpoint.id ? endpoint.id : createWebhookId(),
    url: typeof endpoint.url === "string" ? endpoint.url : "",
    events,
    secret: typeof endpoint.secret === "string" ? endpoint.secret : "",
    status: "active",
    lastTriggeredLabel: typeof endpoint.lastTriggeredLabel === "string" ? endpoint.lastTriggeredLabel : "Never tested",
    lastResponseLabel: typeof endpoint.lastResponseLabel === "string" ? endpoint.lastResponseLabel : null,
    lastResponseBody: typeof endpoint.lastResponseBody === "string" ? endpoint.lastResponseBody : null,
    lastTestTone: endpoint.lastTestTone === "error" ? "error" : endpoint.lastTestTone === "success" ? "success" : null
  };
}

function normalizeSlackState(nextSlack: Partial<DashboardIntegrationsState["slack"]>) {
  const slack = {
    ...DEFAULT_INTEGRATIONS_STATE.slack,
    ...nextSlack,
    notifications: {
      ...DEFAULT_INTEGRATIONS_STATE.slack.notifications,
      ...nextSlack.notifications
    }
  };

  if (
    slack.status === "connected" &&
    slack.lastValidatedAt &&
    Date.now() - new Date(slack.lastValidatedAt).getTime() > SLACK_RECONNECT_AFTER_MS
  ) {
    return {
      ...slack,
      status: "reconnect" as const,
      errorMessage: slack.errorMessage ?? "Connection lost"
    };
  }

  return slack;
}

export function sanitizeIntegrationsState(value: unknown): DashboardIntegrationsState {
  const next = typeof value === "object" && value ? (value as Partial<DashboardIntegrationsState>) : {};
  return {
    slack: normalizeSlackState(next.slack ?? {}),
    zapier: { ...DEFAULT_INTEGRATIONS_STATE.zapier, ...next.zapier },
    shopify: { ...DEFAULT_INTEGRATIONS_STATE.shopify, ...next.shopify, errorMessage: next.shopify?.errorMessage ?? null },
    webhooks: Array.isArray(next.webhooks) ? next.webhooks.map(sanitizeWebhook) : []
  };
}

export function createConnectedSlackState(nextSlack: SlackIntegrationState): SlackIntegrationState {
  return {
    ...nextSlack,
    status: "connected",
    errorMessage: null,
    lastValidatedAt: new Date().toISOString()
  };
}

export function upsertWebhook(
  webhooks: DashboardWebhookEndpoint[],
  input: SaveWebhookInput
) {
  const nextWebhook = sanitizeWebhook(input);
  const existingIndex = webhooks.findIndex((endpoint) => endpoint.id === nextWebhook.id);

  if (existingIndex === -1) {
    return {
      created: true,
      webhooks: [...webhooks, nextWebhook]
    };
  }

  return {
    created: false,
    webhooks: webhooks.map((endpoint) =>
      endpoint.id === nextWebhook.id ? { ...endpoint, ...nextWebhook } : endpoint
    )
  };
}

export function buildWebhookTestResult(url: string): WebhookTestResult {
  if (!/fail|error|500/i.test(url)) {
    return {
      tone: "success",
      title: "Test successful",
      message: "Received 200 OK in 234ms",
      responseBody: null
    };
  }

  return {
    tone: "error",
    title: "Test failed",
    message: "Received 500 Internal Server Error",
    responseBody: JSON.stringify(
      {
        error: "Internal Server Error",
        request_id: "req_demo_123",
        detail: "Webhook destination rejected the payload."
      },
      null,
      2
    )
  };
}

export function applyWebhookTestResult(
  endpoint: DashboardWebhookEndpoint,
  result: WebhookTestResult
): DashboardWebhookEndpoint {
  return {
    ...endpoint,
    lastTriggeredLabel: "Just now",
    lastResponseLabel: result.message,
    lastResponseBody: result.responseBody,
    lastTestTone: result.tone
  };
}
