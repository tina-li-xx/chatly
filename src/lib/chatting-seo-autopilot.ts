import "server-only";

import { getChattingPublishingWorkspace } from "@/lib/chatting-publishing-workspace";
import { getChattingSeoStoredKeywordResearch } from "@/lib/chatting-seo-keyword-corpus";
import { ensureDashboardPublishingDraftAutopilot } from "@/lib/data/dashboard-publishing-drafts-bootstrap";
import { ensureDashboardPublishingSeoBootstrap } from "@/lib/data/dashboard-publishing-seo-bootstrap";

export async function runChattingSeoAutopilot() {
  const workspace = await getChattingPublishingWorkspace();

  if (!workspace) {
    return { generatedDraftCount: 0, status: "skipped" as const };
  }

  await getChattingSeoStoredKeywordResearch({
    ownerUserId: workspace.ownerUserId,
    actorUserId: workspace.actorUserId
  });
  await ensureDashboardPublishingSeoBootstrap(workspace);
  const generatedDrafts = await ensureDashboardPublishingDraftAutopilot(workspace);

  return {
    generatedDraftCount: generatedDrafts.length,
    ownerUserId: workspace.ownerUserId,
    status: "ran" as const
  };
}
