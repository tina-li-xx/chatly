"use client";

import { Button, ButtonLink } from "../components/ui/Button";

export function UpgradeButton({
  onClick
}: {
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="secondary" size="md" onClick={onClick}>
      Upgrade to Growth
    </Button>
  );
}

export function ConnectAction({
  busy,
  busyLabel,
  idleLabel,
  onClick
}: {
  busy: boolean;
  busyLabel: string;
  idleLabel: string;
  onClick: () => void;
}) {
  return (
    <Button type="button" variant="secondary" size="md" onClick={onClick} disabled={busy}>
      {busy ? busyLabel : idleLabel}
    </Button>
  );
}

export function ConnectedActions({
  primaryLabel = "Settings",
  onSettings,
  onDisconnect
}: {
  primaryLabel?: string;
  onSettings: () => void;
  onDisconnect: () => void;
}) {
  return (
    <>
      <Button type="button" variant="secondary" size="md" onClick={onSettings}>
        {primaryLabel}
      </Button>
      <TextDangerButton label="Disconnect" onClick={onDisconnect} />
    </>
  );
}

export function DisconnectOnlyAction({
  onDisconnect
}: {
  onDisconnect: () => void;
}) {
  return <TextDangerButton label="Disconnect" onClick={onDisconnect} />;
}

export function ReadyActions({
  onViewApiKey,
  onRemoveKey
}: {
  onViewApiKey: () => void;
  onRemoveKey: () => void;
}) {
  return (
    <>
      <Button type="button" variant="secondary" size="md" onClick={onViewApiKey}>
        View API key
      </Button>
      <TextDangerButton label="Remove key" onClick={onRemoveKey} />
    </>
  );
}

export function ConfigureWebhooksAction() {
  return (
    <ButtonLink href="/dashboard/settings/integrations/webhooks" variant="secondary" size="md">
      Configure
    </ButtonLink>
  );
}

function TextDangerButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-11 items-center justify-center rounded-2xl px-1 text-sm font-medium text-slate-400 transition hover:text-red-600">
      {label}
    </button>
  );
}
