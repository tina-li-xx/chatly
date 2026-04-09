"use client";

import { SettingsIntegrationsCard } from "./dashboard-settings-integrations-card";
import { IntegrationStatusBadge } from "./dashboard-settings-integrations-primitives";
import { UpgradeButton } from "./dashboard-settings-integrations-card-actions";

export type CardTone = "default" | "locked" | "warning" | "error";
type BadgeTone = "success" | "warning" | "locked" | "error";
type IntegrationKind = "slack" | "zapier" | "webhooks" | "shopify";

export type CardMeta = {
  kind: IntegrationKind;
  title: string;
  description: string;
};

export const SLACK_CARD: CardMeta = {
  kind: "slack",
  title: "Slack",
  description: "Get notified and reply from Slack"
};

export const ZAPIER_CARD: CardMeta = {
  kind: "zapier",
  title: "Zapier",
  description: "Connect to 5,000+ apps for Slack alerts, Sheets logging, and follow-up workflows"
};

export const WEBHOOKS_CARD: CardMeta = {
  kind: "webhooks",
  title: "Webhooks",
  description: "Send events to any URL"
};

export const SHOPIFY_CARD: CardMeta = {
  kind: "shopify",
  title: "Shopify",
  description: "See customer order history"
};

export function renderStatusBadge(tone: BadgeTone, label: string) {
  return <IntegrationStatusBadge tone={tone} label={label} />;
}

export function renderLockedCard(meta: CardMeta, onUpgrade: () => void) {
  return (
    <SettingsIntegrationsCard
      {...meta}
      tone="locked"
      badge={renderStatusBadge("locked", "Growth")}
      actions={<UpgradeButton onClick={onUpgrade} />}
    />
  );
}
