"use client";

import { useState } from "react";
import type { Site } from "@/lib/types";
import { classNames } from "@/lib/utils";
import { LaptopIcon, PhoneIcon } from "./dashboard-ui";
import { WidgetPreviewFrame } from "./dashboard-widget-settings-preview";
import type { WidgetPreviewMode } from "./dashboard-widget-settings-preview-mode";
import { WIDGET_PREVIEW_MODES } from "./dashboard-widget-settings-preview-mode";
import type { PreviewDevice } from "./dashboard-widget-settings-shared";

type WidgetPreviewPaneProps = {
  site: Site;
  device: PreviewDevice;
  onSetPreviewDevice: (device: PreviewDevice) => void;
};

export function WidgetPreviewPane({ site, device, onSetPreviewDevice }: WidgetPreviewPaneProps) {
  const [previewMode, setPreviewMode] = useState<WidgetPreviewMode>("online");

  return (
    <aside className="rounded-xl bg-slate-100 p-8 xl:sticky xl:top-24 xl:self-start">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-slate-500">Preview</p>
          <p className="mt-1 text-sm text-slate-500">Switch states to preview the exact widget copy.</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          {[
            { value: "desktop" as const, icon: LaptopIcon, label: "Desktop" },
            { value: "mobile" as const, icon: PhoneIcon, label: "Mobile" }
          ].map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSetPreviewDevice(option.value)}
                className={classNames(
                  "flex h-8 w-8 items-center justify-center rounded-md transition",
                  device === option.value ? "bg-slate-100 text-slate-900" : "text-slate-500"
                )}
                aria-label={option.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 flex rounded-lg border border-slate-200 bg-white p-1">
        {WIDGET_PREVIEW_MODES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPreviewMode(option.value)}
            className={classNames(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition",
              previewMode === option.value ? "bg-slate-100 text-slate-900" : "text-slate-500"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <WidgetPreviewFrame site={site} device={device} mode={previewMode} />
    </aside>
  );
}
