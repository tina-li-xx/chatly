"use client";

import type { Site } from "@/lib/types";
import { WidgetOfflineCopyPanel } from "./dashboard-widget-settings-offline-copy-panel";
import { ChevronDownIcon } from "./dashboard-ui";
import {
  DAYS,
  RESPONSE_TIME_OPTIONS,
  TIMEZONES,
  ToggleRow
} from "./dashboard-widget-settings-shared";

export function WidgetBehaviorPanel({
  activeSite, proactiveChatUnlocked, onUpdateActiveSite
}: {
  activeSite: Site;
  proactiveChatUnlocked: boolean;
  onUpdateActiveSite: (updater: (site: Site) => Site) => void;
}) {
  return (
    <div className="space-y-5">
      <ToggleRow
        label="Show online status"
        description="Display when your team is available."
        checked={activeSite.showOnlineStatus}
        onToggle={() => onUpdateActiveSite((site) => ({ ...site, showOnlineStatus: !site.showOnlineStatus }))}
      />
      <ToggleRow
        label="Require email when offline"
        description="Ask visitors for email before messaging when the team is away."
        checked={activeSite.requireEmailOffline}
        onToggle={() => onUpdateActiveSite((site) => ({ ...site, requireEmailOffline: !site.requireEmailOffline }))}
      />
      <ToggleRow
        label="Sound notifications"
        description="Play a sound when new messages arrive."
        checked={activeSite.soundNotifications}
        onToggle={() => onUpdateActiveSite((site) => ({ ...site, soundNotifications: !site.soundNotifications }))}
      />
      <div className={!proactiveChatUnlocked ? "opacity-70" : ""}>
        <ToggleRow
          label="Auto-open on specific pages"
          description={
            proactiveChatUnlocked
              ? "Automatically open the widget on certain pages."
              : "Proactive chat unlocks on Growth."
          }
          checked={proactiveChatUnlocked && activeSite.autoOpenPaths.length > 0}
          onToggle={() =>
            proactiveChatUnlocked
              ? onUpdateActiveSite((site) => ({
                  ...site,
                  autoOpenPaths: site.autoOpenPaths.length ? [] : ["/pricing"]
                }))
              : undefined
          }
        />
        {proactiveChatUnlocked && activeSite.autoOpenPaths.length ? (
          <div className="mt-3 border-l-2 border-blue-200 pl-4">
            <input
              value={activeSite.autoOpenPaths.join(", ")}
              onChange={(event) =>
                onUpdateActiveSite((site) => ({
                  ...site,
                  autoOpenPaths: event.target.value
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter(Boolean)
                }))
              }
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none"
              placeholder="/pricing, /contact"
            />
            <p className="mt-1.5 text-xs text-slate-400">Comma-separated list of page paths.</p>
          </div>
        ) : null}
        {!proactiveChatUnlocked ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
            Upgrade to Growth to proactively open the widget on pricing, demo, or comparison pages.
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Response time message</label>
        <div className="relative">
          <select
            value={activeSite.responseTimeMode}
            onChange={(event) =>
              onUpdateActiveSite((site) => ({ ...site, responseTimeMode: event.target.value as Site["responseTimeMode"] }))
            }
            className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900"
          >
            {RESPONSE_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <WidgetOfflineCopyPanel activeSite={activeSite} onUpdateActiveSite={onUpdateActiveSite} />
      <div>
        <ToggleRow
          label="Set operating hours"
          description="Show as offline outside business hours."
          checked={activeSite.operatingHoursEnabled}
          onToggle={() => onUpdateActiveSite((site) => ({ ...site, operatingHoursEnabled: !site.operatingHoursEnabled }))}
        />

        {activeSite.operatingHoursEnabled ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <div className="relative mb-4">
              <select
                value={activeSite.operatingHoursTimezone || "UTC"}
                onChange={(event) => onUpdateActiveSite((site) => ({ ...site, operatingHoursTimezone: event.target.value }))}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900"
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="space-y-2">
              {DAYS.map((day) => {
                const hours = activeSite.operatingHours[day.key];
                return (
                  <div key={day.key} className="flex items-center gap-3 border-b border-slate-200 py-2 last:border-b-0">
                    <input
                      type="checkbox"
                      checked={hours.enabled}
                      onChange={(event) =>
                        onUpdateActiveSite((site) => ({
                          ...site,
                          operatingHours: {
                            ...site.operatingHours,
                            [day.key]: {
                              ...site.operatingHours[day.key],
                              enabled: event.target.checked
                            }
                          }
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="w-24 text-sm text-slate-700">{day.label}</span>
                    <input
                      type="time"
                      value={hours.from}
                      onChange={(event) =>
                        onUpdateActiveSite((site) => ({
                          ...site,
                          operatingHours: {
                            ...site.operatingHours,
                            [day.key]: {
                              ...site.operatingHours[day.key],
                              from: event.target.value
                            }
                          }
                        }))
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700"
                    />
                    <span className="text-sm text-slate-500">to</span>
                    <input
                      type="time"
                      value={hours.to}
                      onChange={(event) =>
                        onUpdateActiveSite((site) => ({
                          ...site,
                          operatingHours: {
                            ...site.operatingHours,
                            [day.key]: {
                              ...site.operatingHours[day.key],
                              to: event.target.value
                            }
                          }
                        }))
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
