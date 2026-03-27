"use client";

import { isSiteWidgetInstalled } from "@/lib/site-installation";
import type { Site } from "@/lib/types";
import { classNames, formatRelativeTime } from "@/lib/utils";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  CopyIcon
} from "./dashboard-ui";
import {
  getPlatformSnippet,
  PLATFORM_OPTIONS,
  type InstallPlatform
} from "./dashboard-widget-settings-shared";

export function WidgetInstallationPanel({
  activeSite,
  installPlatform,
  copiedSnippet,
  verificationState,
  verificationError,
  onSetInstallPlatform,
  onCopySnippet,
  onVerifyInstallation
}: {
  activeSite: Site;
  installPlatform: InstallPlatform;
  copiedSnippet: boolean;
  verificationState: "idle" | "checking";
  verificationError: string;
  onSetInstallPlatform: (value: InstallPlatform) => void;
  onCopySnippet: () => void;
  onVerifyInstallation: () => void;
}) {
  const installCode = getPlatformSnippet(activeSite, installPlatform);
  const verified = isSiteWidgetInstalled(activeSite);
  const verifiedLocation =
    activeSite.widgetLastSeenUrl ||
    activeSite.widgetInstallVerifiedUrl ||
    activeSite.domain ||
    "your site";
  const verificationCopy = activeSite.widgetLastSeenAt
    ? {
        description: `Detected on ${verifiedLocation}`,
        meta: `Last seen ${formatRelativeTime(activeSite.widgetLastSeenAt)}`
      }
    : activeSite.widgetInstallVerifiedAt
      ? {
          description: `Snippet detected on ${verifiedLocation}`,
          meta: `Verified ${formatRelativeTime(activeSite.widgetInstallVerifiedAt)}`
        }
      : activeSite.conversationCount > 0
        ? {
            description: "Conversations have already been recorded for this site.",
            meta: "Historical activity confirms the widget was active."
          }
        : {
            description: "We haven't detected the widget on your site yet.",
            meta: activeSite.domain
              ? "Add the snippet, then check again."
              : "Save your site URL, then add the snippet and check again."
          };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Installation code</label>
        <p className="mb-4 text-[13px] text-slate-500">
          Add this snippet before the closing {`</body>`} tag on your website.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((platform) => (
            <button
              key={platform.value}
              type="button"
              onClick={() => onSetInstallPlatform(platform.value)}
              className={classNames(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                installPlatform === platform.value
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              )}
            >
              {platform.label}
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-lg bg-slate-900 p-4 text-slate-100">
          <button
            type="button"
            onClick={onCopySnippet}
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-600"
          >
            {copiedSnippet ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-400" /> : <CopyIcon className="h-3.5 w-3.5" />}
            <span>{copiedSnippet ? "Copied!" : "Copy"}</span>
          </button>
          <pre className="overflow-x-auto pr-24 text-[13px] leading-6">
            <code>{installCode}</code>
          </pre>
        </div>
      </div>

      <div className={classNames("rounded-lg border px-4 py-4", verified ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50")}>
        <div className="flex items-start gap-3">
          <CheckCircleIcon className={classNames("mt-0.5 h-5 w-5", verified ? "text-green-500" : "text-amber-500")} />
          <div>
            <div className={classNames("text-sm font-medium", verified ? "text-green-700" : "text-amber-700")}>
              {verified ? "Widget installed" : "Widget not detected"}
            </div>
            <div className={classNames("mt-1 text-[13px]", verified ? "text-green-600" : "text-amber-600")}>
              {verificationCopy.description}
            </div>
            <div className={classNames("mt-1 text-xs", verified ? "text-green-500" : "text-amber-500")}>
              {verificationCopy.meta}
            </div>

            {!verified ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onVerifyInstallation}
                  disabled={verificationState === "checking"}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-amber-300 bg-white px-3 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  {verificationState === "checking" ? "Checking…" : "Check installation"}
                </button>
                {verificationError ? <span className="text-xs text-amber-600">{verificationError}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-slate-700">Installation guides</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {["WordPress", "Shopify", "Webflow", "Squarespace", "Wix", "Custom HTML"].map((guide) => (
            <button
              key={guide}
              type="button"
              onClick={() =>
                onSetInstallPlatform(
                  guide === "WordPress"
                    ? "wordpress"
                    : guide === "Shopify"
                      ? "shopify"
                      : guide === "Webflow"
                        ? "webflow"
                        : "html"
                )
              }
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-4 text-left transition hover:bg-slate-50"
            >
              <span className="text-sm font-medium text-slate-700">{guide}</span>
              <ChevronRightIcon className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
