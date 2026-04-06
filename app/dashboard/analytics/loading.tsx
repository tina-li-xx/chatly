"use client";

import { useSearchParams } from "next/navigation";
import { DashboardAnalyticsLoading } from "../dashboard-analytics-loading";
import { resolveAnalyticsSection } from "../dashboard-analytics-section";

export default function AnalyticsLoading() {
  const searchParams = useSearchParams();

  return (
    <DashboardAnalyticsLoading
      activeSection={resolveAnalyticsSection(searchParams.get("section"))}
      showAllAiActivity={searchParams.get("activity") === "all"}
    />
  );
}
