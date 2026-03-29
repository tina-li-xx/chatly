"use client";

import { SettingsEmailTemplates } from "./settings-email-templates";
import type { DashboardSettingsEmail } from "@/lib/data";
import {
  DASHBOARD_INPUT_CLASS,
  type DashboardNoticeState
} from "./dashboard-controls";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";
export { SettingsBillingSection } from "./dashboard-settings-billing-section";

export function SettingsEmailSection({
  title,
  subtitle,
  email,
  profileEmail,
  profileName,
  profileAvatarDataUrl,
  showTranscriptBrandingPreview,
  onUpdateEmail,
  onNotice
}: {
  title: string;
  subtitle: string;
  email: DashboardSettingsEmail;
  profileEmail: string;
  profileName: string;
  profileAvatarDataUrl: string | null;
  showTranscriptBrandingPreview: boolean;
  onUpdateEmail: <K extends keyof DashboardSettingsEmail>(key: K, value: DashboardSettingsEmail[K]) => void;
  onNotice: (value: DashboardNoticeState) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <SettingsCard title="Notification email" description="Where we send team notifications.">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Email address</span>
          <input
            type="email"
            value={email.notificationEmail}
            onChange={(event) => onUpdateEmail("notificationEmail", event.target.value)}
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
      </SettingsCard>

      <SettingsCard title="Reply-to address" description="Visitors will reply to this address.">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Reply-to email</span>
          <input
            type="email"
            value={email.replyToEmail}
            onChange={(event) => onUpdateEmail("replyToEmail", event.target.value)}
            className={DASHBOARD_INPUT_CLASS}
          />
        </label>
      </SettingsCard>

      <SettingsEmailTemplates
        templates={email.templates}
        notificationEmail={email.notificationEmail}
        replyToEmail={email.replyToEmail}
        profileEmail={profileEmail}
        profileName={profileName}
        profileAvatarDataUrl={profileAvatarDataUrl}
        showTranscriptBrandingPreview={showTranscriptBrandingPreview}
        onChange={(templates) => onUpdateEmail("templates", templates)}
        onNotice={onNotice}
      />

      <SettingsCard title="Email signature">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
            {["B", "I", "Link", "Image"].map((item) => (
              <span key={item} className="rounded-md px-2 py-1 text-xs font-medium text-slate-500">
                {item}
              </span>
            ))}
          </div>
          <textarea
            value={email.emailSignature}
            onChange={(event) => onUpdateEmail("emailSignature", event.target.value)}
            className="min-h-[140px] w-full resize-y border-0 px-3.5 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-0"
            placeholder="Best,&#10;The Chatting team"
          />
        </div>
      </SettingsCard>
    </div>
  );
}
