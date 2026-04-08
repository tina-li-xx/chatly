"use client";

import { useState } from "react";
import { Button } from "../components/ui/Button";
import { DashboardModal } from "./dashboard-modal";
import {
  IntegrationCheckbox,
  IntegrationFieldLabel,
  INTEGRATION_SELECT_CLASS
} from "./dashboard-settings-integrations-primitives";
import { SLACK_CHANNEL_OPTIONS, type SlackIntegrationState } from "./dashboard-integrations-types";

export function SettingsIntegrationsSlackModal({
  mode,
  initialState,
  workspaceName,
  onClose,
  onSave
}: {
  mode: "connect" | "settings";
  initialState: SlackIntegrationState;
  workspaceName?: string;
  onClose: () => void;
  onSave: (nextState: SlackIntegrationState) => Promise<void> | void;
}) {
  const [channelId, setChannelId] = useState(initialState.channelId);
  const [notifications, setNotifications] = useState(initialState.notifications);
  const [replyFromSlack, setReplyFromSlack] = useState(initialState.replyFromSlack);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const channelName = SLACK_CHANNEL_OPTIONS.find((option) => option.value === channelId)?.label ?? "#support-chat";
    setSaving(true);

    try {
      await onSave({
        ...initialState,
        status: "connected",
        workspaceName: workspaceName || initialState.workspaceName,
        channelId,
        channelName,
        notifications,
        replyFromSlack
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardModal
      title={mode === "connect" ? "Connect Slack" : "Slack Settings"}
      onClose={saving ? () => {} : onClose}
      widthClass="max-w-[640px]"
    >
      <div className="space-y-6 px-6 py-6">
        {mode === "connect" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            <p className="font-medium">Connected to {workspaceName || initialState.workspaceName} workspace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <IntegrationFieldLabel>Workspace</IntegrationFieldLabel>
            <p className="text-sm font-medium text-slate-900">{initialState.workspaceName}</p>
          </div>
        )}

        <div className="space-y-3">
          <IntegrationFieldLabel>{mode === "connect" ? "Where should we send notifications?" : "Notification channel"}</IntegrationFieldLabel>
          <select value={channelId} onChange={(event) => setChannelId(event.currentTarget.value as SlackIntegrationState["channelId"])} className={INTEGRATION_SELECT_CLASS}>
            {SLACK_CHANNEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-sm leading-6 text-slate-500">
            We&apos;ll post new conversations here. Your team can reply directly from Slack.
          </p>
        </div>

        {mode === "settings" ? (
          <>
            <div className="space-y-3 border-t border-slate-200 pt-6">
              <IntegrationFieldLabel>Notify when</IntegrationFieldLabel>
              <div className="space-y-2">
                <IntegrationCheckbox checked={notifications.newConversation} label="New conversation" onChange={(checked) => setNotifications((current) => ({ ...current, newConversation: checked }))} />
                <IntegrationCheckbox checked={notifications.assignedToMe} label="Conversation assigned to me" onChange={(checked) => setNotifications((current) => ({ ...current, assignedToMe: checked }))} />
                <IntegrationCheckbox checked={notifications.resolved} label="Conversation resolved" onChange={(checked) => setNotifications((current) => ({ ...current, resolved: checked }))} />
                <IntegrationCheckbox checked={notifications.allMessages} label="All new messages" onChange={(checked) => setNotifications((current) => ({ ...current, allMessages: checked }))} />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-6">
              <IntegrationFieldLabel>Reply from Slack</IntegrationFieldLabel>
              <IntegrationCheckbox
                checked={replyFromSlack}
                label="Allow team members to reply from Slack"
                description="Replies in the thread will be sent to the visitor."
                onChange={setReplyFromSlack}
              />
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
        <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" size="md" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving..." : mode === "connect" ? "Save & finish" : "Save changes"}
        </Button>
      </div>
    </DashboardModal>
  );
}
