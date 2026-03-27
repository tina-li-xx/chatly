"use client";

import type { ChangeEvent, RefObject } from "react";
import type { DashboardSettingsProfile } from "@/lib/data";
import { initialsFromLabel } from "@/lib/user-display";
import { classNames } from "@/lib/utils";
import { CameraIcon } from "./dashboard-ui";
import {
  DASHBOARD_INPUT_CLASS,
  DASHBOARD_SECONDARY_BUTTON_CLASS
} from "./dashboard-controls";
import {
  SettingsCard,
  SettingsSectionHeader
} from "./dashboard-settings-shared";

type PasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordMeter = {
  label: string;
  widthClass: string;
  toneClass: string;
};

export function SettingsProfileSection({
  title,
  subtitle,
  profile,
  currentProfileName,
  fileInputRef,
  passwordDraft,
  passwordExpanded,
  passwordMeter,
  onUpdateProfile,
  onAvatarPick,
  onSetPasswordExpanded,
  onSetPasswordDraft
}: {
  title: string;
  subtitle: string;
  profile: DashboardSettingsProfile;
  currentProfileName: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  passwordDraft: PasswordDraft;
  passwordExpanded: boolean;
  passwordMeter: PasswordMeter;
  onUpdateProfile: <K extends keyof DashboardSettingsProfile>(
    key: K,
    value: DashboardSettingsProfile[K]
  ) => void;
  onAvatarPick: (event: ChangeEvent<HTMLInputElement>) => void;
  onSetPasswordExpanded: (value: boolean | ((current: boolean) => boolean)) => void;
  onSetPasswordDraft: (value: PasswordDraft | ((current: PasswordDraft) => PasswordDraft)) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title={title} subtitle={subtitle} />

      <SettingsCard className="p-0">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <div className="relative group">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-blue-100">
              {profile.avatarDataUrl ? (
                <img
                  src={profile.avatarDataUrl}
                  alt={`${currentProfileName} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[28px] font-medium text-blue-700">
                  {initialsFromLabel(currentProfileName)}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 hidden items-center justify-center bg-slate-900/50 text-white transition group-hover:flex"
                aria-label="Change profile photo"
              >
                <CameraIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={DASHBOARD_SECONDARY_BUTTON_CLASS}
              >
                Upload photo
              </button>
              <button
                type="button"
                onClick={() => onUpdateProfile("avatarDataUrl", null)}
                className="inline-flex h-9 items-center rounded-lg text-sm font-medium text-red-600 transition hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <p className="text-xs text-slate-400">JPG, PNG or GIF. Max 2MB.</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
            onChange={onAvatarPick}
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Personal information">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">First name</span>
            <input
              value={profile.firstName}
              onChange={(event) => onUpdateProfile("firstName", event.target.value)}
              className={DASHBOARD_INPUT_CLASS}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Last name</span>
            <input
              value={profile.lastName}
              onChange={(event) => onUpdateProfile("lastName", event.target.value)}
              className={DASHBOARD_INPUT_CLASS}
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={profile.email}
              onChange={(event) => onUpdateProfile("email", event.target.value)}
              className={DASHBOARD_INPUT_CLASS}
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Job title</span>
            <input
              value={profile.jobTitle}
              onChange={(event) => onUpdateProfile("jobTitle", event.target.value)}
              placeholder="Support lead"
              className={DASHBOARD_INPUT_CLASS}
            />
          </label>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Password"
        actions={
          <button
            type="button"
            onClick={() => onSetPasswordExpanded((value) => !value)}
            className={DASHBOARD_SECONDARY_BUTTON_CLASS}
          >
            {passwordExpanded ? "Cancel" : "Change password"}
          </button>
        }
      >
        {passwordExpanded ? (
          <div className="space-y-4">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Current password</span>
              <input
                type="password"
                value={passwordDraft.currentPassword}
                onChange={(event) =>
                  onSetPasswordDraft((current) => ({ ...current, currentPassword: event.target.value }))
                }
                className={DASHBOARD_INPUT_CLASS}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">New password</span>
              <input
                type="password"
                value={passwordDraft.newPassword}
                onChange={(event) =>
                  onSetPasswordDraft((current) => ({ ...current, newPassword: event.target.value }))
                }
                className={DASHBOARD_INPUT_CLASS}
              />
              <div className="h-1 rounded-full bg-slate-200">
                <div
                  className={classNames(
                    "h-full rounded-full transition",
                    passwordMeter.widthClass,
                    passwordMeter.toneClass
                  )}
                />
              </div>
              <p className="text-xs text-slate-400">{passwordMeter.label}</p>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Confirm password</span>
              <input
                type="password"
                value={passwordDraft.confirmPassword}
                onChange={(event) =>
                  onSetPasswordDraft((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                className={DASHBOARD_INPUT_CLASS}
              />
            </label>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Your password is hidden for security. Open this section when you want to update it.
          </p>
        )}
      </SettingsCard>
    </div>
  );
}
