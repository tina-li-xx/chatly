"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/toast-provider";
import type {
  AnalyticsAiAssistActivityPageData,
  AnalyticsAiAssistActivityPageSlice
} from "@/lib/data/analytics-ai-assist-activity-page";
import {
  buildAiAssistActivitySearchParams,
  type AnalyticsAiAssistActivityFilters
} from "@/lib/data/analytics-ai-assist-activity-filters";

function buildActivityPageHref(filters: AnalyticsAiAssistActivityFilters) {
  const params = buildAiAssistActivitySearchParams(filters);
  params.set("section", "aiAssist");
  params.set("activity", "all");
  return `/dashboard/analytics?${params.toString()}`;
}

export function useDashboardAnalyticsAiAssistActivityPage(
  data: AnalyticsAiAssistActivityPageData
) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState(data.filters);
  const [extraActivity, setExtraActivity] = useState<
    AnalyticsAiAssistActivityPageSlice["activity"]
  >([]);
  const [nextCursor, setNextCursor] = useState(data.nextCursor);
  const [hasMore, setHasMore] = useState(data.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const activity = useMemo(
    () => [...data.activity, ...extraActivity],
    [data.activity, extraActivity]
  );
  const exportHref = useMemo(
    () =>
      `/dashboard/analytics/activity-export?${buildAiAssistActivitySearchParams(filters).toString()}`,
    [filters]
  );

  useEffect(() => {
    setFilters(data.filters);
    setExtraActivity([]);
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
  }, [data.activity, data.filters, data.hasMore, data.nextCursor]);

  function navigate(nextFilters: AnalyticsAiAssistActivityFilters) {
    setFilters(nextFilters);
    setExtraActivity([]);
    setHasMore(false);
    setNextCursor(null);
    startTransition(() => {
      router.replace(buildActivityPageHref(nextFilters) as never);
    });
  }

  async function exportCsv() {
    if (exporting) {
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(exportHref, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("request");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/i);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = match?.[1] ?? "ai-assist-activity.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast("error", "Could not export AI activity.");
    } finally {
      setExporting(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);
    try {
      const params = buildAiAssistActivitySearchParams(filters);
      params.set("cursorCreatedAt", nextCursor.createdAt);
      params.set("cursorId", nextCursor.id);
      const response = await fetch(`/dashboard/analytics/activity-feed?${params.toString()}`, {
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error("request");
      }

      const payload = (await response.json()) as {
        ok: boolean;
      } & AnalyticsAiAssistActivityPageSlice;
      setExtraActivity((current) => [...current, ...payload.activity]);
      setHasMore(payload.hasMore);
      setNextCursor(payload.nextCursor);
    } catch {
      showToast("error", "Could not load more AI activity.");
    } finally {
      setLoadingMore(false);
    }
  }

  function updateCustomDate(
    field: "customStart" | "customEnd",
    value: string
  ) {
    const nextFilters: AnalyticsAiAssistActivityFilters = { ...filters, [field]: value };
    setFilters(nextFilters);
    if (nextFilters.customStart && nextFilters.customEnd) {
      navigate(nextFilters);
    }
  }

  return {
    activity,
    filters,
    exporting,
    hasMore,
    loadingMore,
    updateCustomDate,
    navigate,
    exportCsv,
    loadMore
  };
}
