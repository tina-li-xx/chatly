"use client";

import type { ZapierIntegrationState } from "./dashboard-integrations-types";
import {
  CHATTING_ZAPIER_SETUP_GUIDE_PATH,
  CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH
} from "@/lib/chatting-zapier-starter-workflows";
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
  onDisconnect,
  onUpgrade
}: {
  unlocked: boolean;
  zapier: ZapierIntegrationState;
  busy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onUpgrade: () => void;
}) {
  if (!unlocked) {
    return renderLockedCard(ZAPIER_CARD, onUpgrade);
  }

  const links = [
    { label: "Starter Zaps", href: CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH },
    { label: "Setup guide", href: CHATTING_ZAPIER_SETUP_GUIDE_PATH }
  ];
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

  return (
    <SettingsIntegrationsCard
      {...ZAPIER_CARD}
      detail={detail}
      links={links}
      badge={badge}
      actions={actions}
    />
  );
}

export function WebhooksIntegrationCard({
  unlocked,
  activeCount,
  onUpgrade
}: {
  unlocked: boolean;
  activeCount: number;
  onUpgrade: () => void;
}) {
  if (!unlocked) {
    return renderLockedCard(WEBHOOKS_CARD, onUpgrade);
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
