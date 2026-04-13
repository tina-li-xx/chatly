"use client";

import { generatePublishingDraftFromPlanItemAction } from "./dashboard-publishing-actions";
import { DashboardPublishingActionButton } from "./dashboard-publishing-action-button";

export function DashboardPublishingGenerateDraftButton({ targetId }: { targetId: string }) {
  return (
    <DashboardPublishingActionButton
      action={() => generatePublishingDraftFromPlanItemAction(targetId)}
      idleLabel="Generate draft"
      pendingLabel="Generating draft..."
    />
  );
}
