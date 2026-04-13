"use client";

import { regeneratePublishingDraftAction, regeneratePublishingPlanItemAction } from "./dashboard-publishing-actions";
import { DashboardPublishingActionButton } from "./dashboard-publishing-action-button";

type PublishingRegenerateKind = "draft" | "plan-item";

function buttonCopy(kind: PublishingRegenerateKind, pending: boolean) {
  if (kind === "draft") {
    return pending ? "Regenerating draft..." : "Regenerate draft";
  }

  return pending ? "Regenerating topic..." : "Regenerate topic";
}

export function DashboardPublishingRegenerateButton({
  kind,
  targetId
}: {
  kind: PublishingRegenerateKind;
  targetId: string;
}) {
  return (
    <DashboardPublishingActionButton
      action={() => kind === "draft"
        ? regeneratePublishingDraftAction(targetId)
        : regeneratePublishingPlanItemAction(targetId)}
      idleLabel={buttonCopy(kind, false)}
      pendingLabel={buttonCopy(kind, true)}
    />
  );
}
