import Link from "next/link";
import type { DashboardPublishingSeoSnapshot } from "@/lib/data/dashboard-publishing-seo";
import {
  formatPublishingSnapshotDate,
  formatPublishingStatusLabel
} from "./dashboard-publishing-formatting";
import { DashboardPublishingRegenerateButton } from "./dashboard-publishing-regenerate-button";
import { SettingsCard, SettingsSectionHeader } from "./dashboard-settings-shared";

export function DashboardPublishingDraftsSection({
  snapshot
}: {
  snapshot: DashboardPublishingSeoSnapshot;
}) {
  const reviewDrafts = snapshot.drafts.filter(
    (draft) => draft.publicationStatus === "draft" && draft.status !== "scheduled"
  );

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Drafts"
        subtitle="Autopilot-generated article drafts land here from the current 30-day plan before they move through review and scheduling."
      />

      {reviewDrafts.length === 0 ? (
        <SettingsCard>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">No generated drafts yet.</div>
        </SettingsCard>
      ) : (
        reviewDrafts.map((draft) => (
          <SettingsCard
            key={draft.id}
            title={
              <Link href={`/dashboard/publishing/${draft.slug}`} className="transition hover:text-blue-700">
                {draft.title}
              </Link>
            }
            description={`/${draft.slug}`}
            actions={
              <div className="flex items-center gap-3">
                <Link href={`/dashboard/publishing/${draft.slug}`} className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
                  Preview draft
                </Link>
                <DashboardPublishingRegenerateButton kind="draft" targetId={draft.id} />
              </div>
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">{formatPublishingStatusLabel(draft.status)}</span> • {draft.publicationStatus}
              </p>
              <p>Updated {formatPublishingSnapshotDate(draft.updatedAt)}</p>
            </div>
            <p className="mt-3 text-sm text-slate-500">Category: {draft.categorySlug || "Unassigned"}</p>
          </SettingsCard>
        ))
      )}
    </div>
  );
}
