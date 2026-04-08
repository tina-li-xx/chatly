"use client";

import type { ZapierIntegrationState } from "./dashboard-integrations-types";
import { SettingsIntegrationsCard } from "./dashboard-settings-integrations-card";
import {
  ConfigureWebhooksAction,
  ConnectAction,
  ConnectedActions,
  ReadyActions
} from "./dashboard-settings-integrations-card-actions";
import {
  WEBHOOKS_CARD,
  ZAPIER_CARD,
  renderLockedCard,
  renderStatusBadge
} from "./dashboard-settings-integrations-card-shared";

export function ZapierIntegrationCard({
  unlocked,
  zapier,
  busy,
  onConnect,
  onDisconnect
}: {
  unlocked: boolean;
  zapier: ZapierIntegrationState;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  if (!unlocked) {
    return renderLockedCard(ZAPIER_CARD);
  }

  const detail = zapier.connected
    ? `${zapier.activeZapCount} active Zaps`
    : zapier.apiKeyReady
      ? "API key ready"
      : undefined;
  const badge = zapier.connected
    ? renderStatusBadge("success", "Connected")
    : zapier.apiKeyReady
      ? renderStatusBadge("warning", "Ready")
      : null;
  const actions = zapier.connected ? (
    <ConnectedActions
      primaryLabel="View API key"
      onSettings={onConnect}
      onDisconnect={onDisconnect}
    />
  ) : zapier.apiKeyReady ? (
    <ReadyActions onViewApiKey={onConnect} onRemoveKey={onDisconnect} />
  ) : (
    <ConnectAction
      busy={busy}
      busyLabel="Connecting..."
      idleLabel="Connect"
      onClick={onConnect}
    />
  );

  return <SettingsIntegrationsCard {...ZAPIER_CARD} detail={detail} badge={badge} actions={actions} />;
}

export function WebhooksIntegrationCard({
  unlocked,
  activeCount
}: {
  unlocked: boolean;
  activeCount: number;
}) {
  if (!unlocked) {
    return renderLockedCard(WEBHOOKS_CARD);
  }

  return (
    <SettingsIntegrationsCard
      {...WEBHOOKS_CARD}
      detail={activeCount > 0 ? `Sending to ${activeCount} endpoint${activeCount === 1 ? "" : "s"}` : undefined}
      badge={activeCount > 0 ? renderStatusBadge("success", `${activeCount} active`) : null}
      actions={<ConfigureWebhooksAction />}
    />
  );
}
