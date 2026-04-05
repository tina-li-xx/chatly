"use client";

import { Button } from "../components/ui/Button";
import { CheckCircleIcon, RefreshIcon, WarningIcon } from "./dashboard-ui";

export function AutomationFaqConnectionState({
  tone,
  articleCount,
  checkedAt,
  onRetry
}: {
  tone: "connecting" | "connected" | "error";
  articleCount: number | null;
  checkedAt: number | null;
  onRetry: () => void;
}) {
  if (tone === "connecting") {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-3 text-sm font-medium text-blue-700">
          <RefreshIcon className="h-4 w-4 animate-spin" />
          <p>Connecting to help center...</p>
        </div>
      </div>
    );
  }

  if (tone === "connected") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm font-medium text-green-700">
              <CheckCircleIcon className="h-4 w-4" />
              <p>{articleCount === null ? "Connected · URL looks valid" : `Connected · ${articleCount} ${articleCount === 1 ? "article" : "articles"} found`}</p>
            </div>
            <p className="mt-1 pl-7 text-[13px] text-green-600">{formatSyncLabel(checkedAt)}</p>
          </div>
          <Button
            type="button"
            size="md"
            variant="secondary"
            onClick={onRetry}
            className="h-auto border-0 bg-transparent px-0 py-0 text-green-700 hover:bg-transparent hover:text-green-800"
          >
            Sync now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 text-sm font-medium text-red-700">
            <WarningIcon className="h-4 w-4" />
            <p>Couldn't connect</p>
          </div>
          <p className="mt-1 pl-7 text-[13px] text-red-600">Check the URL and make sure it's publicly accessible.</p>
        </div>
        <Button
          type="button"
          size="md"
          variant="secondary"
          onClick={onRetry}
          className="h-auto border-0 bg-transparent px-0 py-0 text-red-700 hover:bg-transparent hover:text-red-800"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}

function formatSyncLabel(checkedAt: number | null) {
  if (!checkedAt) {
    return "Last synced just now";
  }

  const diffMs = Date.now() - checkedAt;
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return "Last synced just now";
  }

  if (diffMinutes < 60) {
    return `Last synced ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  return `Last synced ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
}
