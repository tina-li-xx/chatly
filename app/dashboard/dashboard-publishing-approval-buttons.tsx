"use client";

import { useState } from "react";
import {
  approveAndSchedulePublishingDraftAction,
  approvePublishingDraftAction,
  publishPublishingDraftNowAction
} from "./dashboard-publishing-approval-actions";
import { DashboardPublishingActionButton } from "./dashboard-publishing-action-button";
import { buildPublishingSectionHref } from "./dashboard-publishing-section";

function shouldShowApprove(workflowStatus: string, publicationStatus: string) {
  return publicationStatus === "draft" && (workflowStatus === "draft" || workflowStatus === "ready_for_review");
}

function shouldShowSchedule(workflowStatus: string, publicationStatus: string) {
  return publicationStatus !== "published" && workflowStatus !== "scheduled";
}

function shouldShowPublish(publicationStatus: string) {
  return publicationStatus !== "published";
}

export function DashboardPublishingApprovalButtons({
  draftId,
  workflowStatus,
  publicationStatus
}: {
  draftId: string;
  workflowStatus: string;
  publicationStatus: string;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const showApprove = shouldShowApprove(workflowStatus, publicationStatus);
  const showSchedule = shouldShowSchedule(workflowStatus, publicationStatus);
  const showPublish = shouldShowPublish(publicationStatus);
  const sharedButtonProps = {
    disabled: isBusy,
    onStart: () => setIsBusy(true),
    onComplete: () => setIsBusy(false)
  };

  if (!showApprove && !showSchedule && !showPublish) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showApprove ? (
        <DashboardPublishingActionButton
          {...sharedButtonProps}
          action={() => approvePublishingDraftAction(draftId)}
          idleLabel="Approve draft"
          pendingLabel="Approving..."
        />
      ) : null}
      {showSchedule ? (
        <DashboardPublishingActionButton
          {...sharedButtonProps}
          action={() => approveAndSchedulePublishingDraftAction(draftId)}
          idleLabel={workflowStatus === "approved" ? "Schedule post" : "Approve and schedule"}
          pendingLabel="Scheduling..."
        />
      ) : null}
      {showPublish ? (
        <DashboardPublishingActionButton
          {...sharedButtonProps}
          action={() => publishPublishingDraftNowAction(draftId)}
          idleLabel="Publish now"
          pendingLabel="Publishing..."
          redirectOnSuccess={buildPublishingSectionHref("queue")}
          showToastOnRedirect
          variant="primary"
        />
      ) : null}
    </div>
  );
}
