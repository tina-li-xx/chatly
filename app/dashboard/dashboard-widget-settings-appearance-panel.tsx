"use client";

import type { Site } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { PreviewAvatar } from "./dashboard-widget-settings-preview";
import { COLOR_PRESETS, TEAM_PHOTO_ACCEPT } from "./dashboard-widget-settings-shared";

export function WidgetAppearancePanel({
  activeSite,
  photoActionState,
  photoError,
  onUpdateActiveSite,
  onUploadTeamPhoto,
  onRemoveTeamPhoto
}: {
  activeSite: Site;
  photoActionState: "idle" | "uploading" | "removing";
  photoError: string;
  onUpdateActiveSite: (updater: (site: Site) => Site) => void;
  onUploadTeamPhoto: (file: File) => void;
  onRemoveTeamPhoto: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Branding</p>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Site URL</label>
          <input
            value={activeSite.domain ?? ""}
            onChange={(event) => onUpdateActiveSite((site) => ({ ...site, domain: event.target.value }))}
            className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none"
            placeholder="https://example.com"
          />
          <p className="mt-1.5 text-xs text-slate-400">Required for widget setup and installation verification.</p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700">Brand color</label>
            <span className="font-mono text-[13px] text-slate-500">{activeSite.brandColor.toUpperCase()}</span>
          </div>
          <div className="flex h-11 overflow-hidden rounded-lg border border-slate-200">
            <button
              type="button"
              className="w-11 border-r border-slate-200"
              style={{ backgroundColor: activeSite.brandColor }}
              aria-label="Current brand color"
            />
            <input
              value={activeSite.brandColor}
              onChange={(event) => onUpdateActiveSite((site) => ({ ...site, brandColor: event.target.value.toUpperCase() }))}
              className="flex-1 px-3 font-mono text-sm text-slate-900 outline-none"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onUpdateActiveSite((site) => ({ ...site, brandColor: color }))}
                className={classNames(
                  "h-7 w-7 rounded-md border-2 transition hover:scale-110",
                  activeSite.brandColor.toUpperCase() === color ? "border-blue-600" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                aria-label={`Use ${color} as the brand color`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Team name</label>
          <input
            value={activeSite.widgetTitle}
            onChange={(event) => onUpdateActiveSite((site) => ({ ...site, widgetTitle: event.target.value }))}
            className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none"
            placeholder="e.g., Acme Support"
          />
          <p className="mt-1.5 text-xs text-slate-400">Shown in the widget header.</p>
        </div>

        <div id="welcome-message" className="mt-5 scroll-mt-24">
          <label className="mb-2 block text-sm font-medium text-slate-700">Welcome message</label>
          <textarea
            value={activeSite.greetingText}
            onChange={(event) =>
              onUpdateActiveSite((site) => ({ ...site, greetingText: event.target.value.slice(0, 150) }))
            }
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-900 outline-none"
            placeholder="Hi there! How can we help?"
          />
          <p className="mt-1.5 text-right text-xs text-slate-400">{activeSite.greetingText.length}/150</p>
        </div>
      </div>

      <div>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Position</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "left" as const, label: "Bottom left" },
            { value: "right" as const, label: "Bottom right" }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdateActiveSite((site) => ({ ...site, launcherPosition: option.value }))}
              className={classNames(
                "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition",
                activeSite.launcherPosition === option.value
                  ? "border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Avatars</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "photos" as const, label: "Photos" },
            { value: "initials" as const, label: "Initials" },
            { value: "icon" as const, label: "Icon" }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onUpdateActiveSite((site) => ({ ...site, avatarStyle: option.value }))}
              className={classNames(
                "rounded-lg border px-4 py-4 text-center transition",
                activeSite.avatarStyle === option.value
                  ? "border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              <div className="mx-auto flex justify-center">
                <PreviewAvatar site={{ ...activeSite, avatarStyle: option.value }} />
              </div>
              <div className={classNames("mt-2 text-xs", activeSite.avatarStyle === option.value ? "text-blue-600" : "text-slate-600")}>
                {option.label}
              </div>
            </button>
          ))}
        </div>

        {activeSite.avatarStyle === "photos" ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <PreviewAvatar site={activeSite} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-700">Team photo</div>
                <div className="mt-1 text-[13px] leading-5 text-slate-500">
                  {activeSite.teamPhotoUrl
                    ? "Used by the live widget anywhere Photos is selected."
                    : "Upload one team photo for the widget avatar."}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <input
                  type="file"
                  accept={TEAM_PHOTO_ACCEPT}
                  className="hidden"
                  disabled={photoActionState !== "idle"}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) {
                      onUploadTeamPhoto(file);
                    }
                  }}
                />
                {photoActionState === "uploading" ? "Uploading…" : activeSite.teamPhotoUrl ? "Replace photo" : "Upload photo"}
              </label>

              {activeSite.teamPhotoUrl ? (
                <button
                  type="button"
                  onClick={onRemoveTeamPhoto}
                  disabled={photoActionState !== "idle"}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {photoActionState === "removing" ? "Removing…" : "Remove photo"}
                </button>
              ) : null}
            </div>

            <p className="mt-2 text-xs text-slate-400">PNG, JPG, GIF, or WebP. Max 2MB. Stored in Cloudflare R2.</p>

            {photoError ? (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {photoError}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
