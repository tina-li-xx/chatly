"use client";

import type {
  SlackIntegrationState,
  ShopifyIntegrationState
} from "./dashboard-integrations-types";
import { SettingsIntegrationsCard } from "./dashboard-settings-integrations-card";
import {
  ConnectAction,
  ConnectedActions,
  DisconnectOnlyAction
} from "./dashboard-settings-integrations-card-actions";
import {
  CardTone,
  SHOPIFY_CARD,
  SLACK_CARD,
  renderLockedCard,
  renderStatusBadge
} from "./dashboard-settings-integrations-card-shared";

export {
  WebhooksIntegrationCard,
  ZapierIntegrationCard
} from "./dashboard-settings-integrations-automation-cards";

export function SlackIntegrationCard({
  unlocked,
  slack,
  busy,
  onConnect,
  onSettings,
  onDisconnect,
  onUpgrade
}: {
  unlocked: boolean;
  slack: SlackIntegrationState;
  busy: boolean;
  onConnect: () => void;
  onSettings: () => void;
  onDisconnect: () => void;
  onUpgrade: () => void;
}) {
  if (!unlocked) {
    return renderLockedCard(SLACK_CARD, onUpgrade);
  }

  const tone: CardTone =
    slack.status === "reconnect"
      ? "warning"
      : slack.status === "error"
        ? "error"
        : "default";
  const detail =
    slack.status === "connected"
      ? `Posting to ${slack.channelName}`
      : slack.errorMessage ?? undefined;
  const badge =
    slack.status === "connected"
      ? renderStatusBadge("success", "Connected")
      : slack.status === "reconnect"
        ? renderStatusBadge("warning", "Reconnect")
        : slack.status === "error"
          ? renderStatusBadge("error", "Try again")
          : null;
  const actions =
    slack.status === "connected" ? (
      <ConnectedActions onSettings={onSettings} onDisconnect={onDisconnect} />
    ) : (
      <ConnectAction
        busy={busy}
        busyLabel="Authorizing..."
        idleLabel={
          slack.status === "reconnect"
            ? "Reconnect"
            : slack.status === "error"
              ? "Try again"
              : "Connect"
        }
        onClick={onConnect}
      />
    );

  return (
    <SettingsIntegrationsCard
      {...SLACK_CARD}
      detail={detail}
      tone={tone}
      badge={badge}
      actions={actions}
    />
  );
}

export function ShopifyIntegrationCard({
  unlocked,
  shopify,
  busy,
  onConnect,
  onDisconnect,
  onUpgrade
}: {
  unlocked: boolean;
  shopify: ShopifyIntegrationState;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onUpgrade: () => void;
}) {
  if (!unlocked) {
    return renderLockedCard(SHOPIFY_CARD, onUpgrade);
  }

  const tone: CardTone = shopify.status === "error" ? "error" : "default";
  const detail =
    shopify.status === "connected"
      ? shopify.domain
      : shopify.errorMessage ?? undefined;
  const badge =
    shopify.status === "connected"
      ? renderStatusBadge("success", "Connected")
      : shopify.status === "error"
        ? renderStatusBadge("error", "Try again")
        : null;
  const actions =
    shopify.status === "connected" ? (
      <DisconnectOnlyAction onDisconnect={onDisconnect} />
    ) : (
      <ConnectAction
        busy={busy}
        busyLabel="Connecting..."
        idleLabel={shopify.status === "error" ? "Try again" : "Connect"}
        onClick={onConnect}
      />
    );

  return (
    <SettingsIntegrationsCard
      {...SHOPIFY_CARD}
      detail={detail}
      tone={tone}
      badge={badge}
      actions={actions}
    />
  );
}
