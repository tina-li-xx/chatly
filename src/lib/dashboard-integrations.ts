export type SlackChannelId = "support-chat" | "sales-pipeline" | "vip-customers";
export type SlackIntegrationStatus = "disconnected" | "connected" | "reconnect" | "error";
export type ShopifyIntegrationStatus = "disconnected" | "connected" | "error";
export type WebhookEventKey =
  | "conversation.created"
  | "conversation.resolved"
  | "conversation.assigned"
  | "message.received"
  | "contact.created"
  | "contact.updated"
  | "tag.added";

export type SlackIntegrationState = {
  status: SlackIntegrationStatus;
  workspaceName: string;
  channelId: SlackChannelId;
  channelName: string;
  errorMessage: string | null;
  lastValidatedAt: string | null;
  notifications: {
    newConversation: boolean;
    assignedToMe: boolean;
    resolved: boolean;
    allMessages: boolean;
  };
  replyFromSlack: boolean;
};

export type ZapierIntegrationState = {
  connected: boolean;
  apiKeyReady: boolean;
  apiKey: string;
  activeZapCount: number | null;
};

export type ShopifyIntegrationState = {
  status: ShopifyIntegrationStatus;
  domain: string;
  errorMessage: string | null;
};

export type ShopifyCustomerOrderSummary = {
  id: string;
  totalLabel: string;
  dateLabel: string;
  itemsLabel: string;
  statusLabel: string;
};

export type ShopifyCustomerContext = {
  displayName: string;
  customerSinceLabel: string;
  totalOrders: number;
  totalSpentLabel: string;
  lastOrderLabel: string;
  recentOrders: ShopifyCustomerOrderSummary[];
  customerUrl: string;
};

export type DashboardWebhookEndpoint = {
  id: string;
  url: string;
  events: WebhookEventKey[];
  secret: string;
  status: "active";
  lastTriggeredLabel: string;
  lastResponseLabel: string | null;
  lastResponseBody: string | null;
  lastTestTone: "success" | "error" | null;
};

export type DashboardIntegrationsState = {
  slack: SlackIntegrationState;
  zapier: ZapierIntegrationState;
  shopify: ShopifyIntegrationState;
  webhooks: DashboardWebhookEndpoint[];
};

export type SaveWebhookInput = {
  id?: string;
  url: string;
  events: WebhookEventKey[];
  secret: string;
};

export const SLACK_CHANNEL_OPTIONS: Array<{ value: SlackChannelId; label: string }> = [
  { value: "support-chat", label: "#support-chat" },
  { value: "sales-pipeline", label: "#sales-pipeline" },
  { value: "vip-customers", label: "#vip-customers" }
];

export const WEBHOOK_EVENT_OPTIONS: Array<{ value: WebhookEventKey; label: string; description: string }> = [
  { value: "conversation.created", label: "conversation.created", description: "New conversation started" },
  { value: "conversation.resolved", label: "conversation.resolved", description: "Conversation marked resolved" },
  { value: "conversation.assigned", label: "conversation.assigned", description: "Conversation assigned to someone" },
  { value: "message.received", label: "message.received", description: "New message from visitor" },
  { value: "contact.created", label: "contact.created", description: "New contact added" },
  { value: "contact.updated", label: "contact.updated", description: "Contact info changed" },
  { value: "tag.added", label: "tag.added", description: "Tag added to conversation" }
];

export const ZAPIER_TRIGGER_OPTIONS = ["New conversation", "Conversation resolved", "New contact", "Tag added"];
export const ZAPIER_ACTION_OPTIONS = ["Create contact", "Add tag to contact", "Send message"];

export const DEFAULT_INTEGRATIONS_STATE: DashboardIntegrationsState = {
  slack: {
    status: "disconnected",
    workspaceName: "Acme Corp",
    channelId: "support-chat",
    channelName: "#support-chat",
    errorMessage: null,
    lastValidatedAt: null,
    notifications: {
      newConversation: true,
      assignedToMe: true,
      resolved: false,
      allMessages: false
    },
    replyFromSlack: true
  },
  zapier: {
    connected: false,
    apiKeyReady: false,
    apiKey: "",
    activeZapCount: null
  },
  shopify: {
    status: "disconnected",
    domain: "",
    errorMessage: null
  },
  webhooks: []
};
