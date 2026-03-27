"use client";

import type { Site } from "@/lib/types";
import { classNames } from "@/lib/utils";
import {
  ChatBubbleIcon
} from "./dashboard-ui";
import { previewStatus, type PreviewDevice } from "./dashboard-widget-settings-shared";

export function PreviewAvatar({ site, compact = false }: { site: Site; compact?: boolean }) {
  const size = compact ? "h-7 w-7 text-[11px]" : "h-10 w-10 text-sm";

  if (site.avatarStyle === "icon") {
    return (
      <span className={classNames("flex items-center justify-center rounded-full bg-blue-100 text-blue-700", size)}>
        <ChatBubbleIcon className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
      </span>
    );
  }

  if (site.avatarStyle === "photos") {
    if (site.teamPhotoUrl) {
      return (
        <span className={classNames("block overflow-hidden rounded-full bg-slate-100 shadow-sm", size)}>
          <img src={site.teamPhotoUrl} alt={site.widgetTitle} className="h-full w-full object-cover" />
        </span>
      );
    }

    return (
      <span
        className={classNames(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-orange-200 to-rose-300 text-[0] shadow-sm",
          size
        )}
      >
        <span className={compact ? "h-3.5 w-3.5 rounded-full bg-white/70" : "h-5 w-5 rounded-full bg-white/70"} />
      </span>
    );
  }

  const initials =
    site.widgetTitle
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CT";

  return (
    <span className={classNames("flex items-center justify-center rounded-full bg-blue-100 font-medium text-blue-700", size)}>
      {initials}
    </span>
  );
}

export function WidgetPreviewFrame({
  site,
  device
}: {
  site: Site;
  device: PreviewDevice;
}) {
  const alignClass = site.launcherPosition === "left" ? "left-6" : "right-6";
  const headerStatus = previewStatus(site);
  const welcomeCopy = site.greetingText.slice(0, 150);

  const widget = (
    <div
      className={classNames(
        "absolute bottom-6 z-10 transition-all duration-300",
        site.launcherPosition === "left" ? "left-6" : "right-6",
        device === "desktop" ? "scale-[0.88]" : "left-1/2 -translate-x-1/2 scale-100"
      )}
      style={device === "desktop" ? undefined : { width: "240px" }}
    >
      <div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        style={{ width: device === "desktop" ? "360px" : "240px", height: "420px" }}
      >
        <div className="flex h-14 items-center justify-between px-4 text-white" style={{ backgroundColor: site.brandColor }}>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-medium">{site.widgetTitle}</div>
            {headerStatus ? <div className="truncate text-[12px] text-white/80">{headerStatus}</div> : null}
          </div>
          <span className="text-base text-white/90">×</span>
        </div>

        <div className="flex h-[calc(100%-56px)] flex-col bg-white">
          <div className="flex-1 space-y-4 overflow-hidden px-4 py-4">
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-[12px] rounded-bl-[4px] bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900">
                {welcomeCopy}
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-[12px] rounded-br-[4px] px-4 py-3 text-sm leading-6 text-white" style={{ backgroundColor: site.brandColor }}>
                Hi! I have a quick question.
              </div>
            </div>
            <div className="flex items-end gap-2">
              <PreviewAvatar site={site} compact />
              <div className="max-w-[78%] rounded-[12px] rounded-bl-[4px] bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900">
                Happy to help. Tell us what you’re looking for.
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <div className="flex items-end gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-500">
                +
              </button>
              <div className="min-h-10 flex-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-400">Type a message…</div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: site.brandColor }}
              >
                ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {device === "desktop" ? (
        <button
          className={classNames("absolute -bottom-2 flex h-[60px] w-[60px] items-center justify-center rounded-full text-white shadow-lg", alignClass)}
          style={{ backgroundColor: site.brandColor }}
        >
          <ChatBubbleIcon className="h-6 w-6" />
        </button>
      ) : null}
    </div>
  );

  if (device === "mobile") {
    return (
      <div className="relative mx-auto h-[560px] w-[280px] overflow-hidden rounded-[32px] border-[8px] border-slate-900 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
        <div className="absolute left-1/2 top-0 h-7 w-[120px] -translate-x-1/2 rounded-b-2xl bg-slate-900" />
        <div className="h-full bg-slate-50 pt-10">{widget}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-slate-100 px-3">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        <div className="mx-auto h-7 w-[220px] rounded-full bg-slate-200" />
      </div>
      <div className="relative h-[420px] overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 px-6 py-6">
        <div className="space-y-4">
          <div className="h-2 w-40 rounded-full bg-slate-200" />
          <div className="h-2 w-64 rounded-full bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-xl bg-white/70 p-4">
                <div className="h-3 w-20 rounded-full bg-slate-200" />
                <div className="mt-4 h-2 w-full rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-4/5 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
        {widget}
      </div>
    </div>
  );
}
