import "server-only";

import { cache } from "react";
import { DASHBOARD_PUBLISHING_VIEWER_EMAIL } from "@/lib/dashboard-publishing-access";
import { findAuthUserByEmail } from "@/lib/repositories/auth-repository";
import { findWorkspaceAccessRow } from "@/lib/repositories/workspace-repository";

export const getChattingPublishingWorkspace = cache(async () => {
  try {
    const user = await findAuthUserByEmail(DASHBOARD_PUBLISHING_VIEWER_EMAIL);
    if (!user) {
      return null;
    }

    const workspace = await findWorkspaceAccessRow(user.id);
    return {
      actorUserId: user.id,
      ownerUserId: workspace?.owner_user_id ?? user.id
    };
  } catch {
    return null;
  }
});
