import type { DashboardLiveEvent } from "@/lib/live-events.types";
import {
  hasConversationAccess,
  listAssignedConversationIdsForMember
} from "@/lib/repositories/shared-repository";

const MEMBER_ACCESS_CACHE_TTL_MS = 30_000;

type DashboardLiveViewer = {
  id: string;
  workspaceOwnerId: string;
  workspaceRole: "owner" | "admin" | "member";
};

type MemberAccessDecision = {
  allowed: boolean;
  expiresAt: number;
};

function readConversationId(event: DashboardLiveEvent) {
  return "conversationId" in event ? event.conversationId ?? null : null;
}

function readAssignedUserId(event: DashboardLiveEvent) {
  if (event.type === "conversation.updated") {
    return event.assignedUserId;
  }

  if (event.type === "message.created") {
    return event.summary?.assignedUserId;
  }

  return undefined;
}

export async function createDashboardLiveAuthorizer(viewer: DashboardLiveViewer) {
  if (viewer.workspaceRole !== "member") {
    return {
      canStreamEvent: async (_event: DashboardLiveEvent) => true
    };
  }

  const allowedConversationIds = new Set(
    await listAssignedConversationIdsForMember(viewer.workspaceOwnerId, viewer.id)
  );
  const memberAccessCache = new Map<string, MemberAccessDecision>();

  return {
    async canStreamEvent(event: DashboardLiveEvent) {
      const conversationId = readConversationId(event);
      if (!conversationId) {
        return true;
      }

      const assignedUserId = readAssignedUserId(event);
      if (assignedUserId !== undefined) {
        memberAccessCache.delete(conversationId);
        if (assignedUserId === viewer.id) {
          allowedConversationIds.add(conversationId);
          return true;
        }

        allowedConversationIds.delete(conversationId);
        return false;
      }

      if (allowedConversationIds.has(conversationId)) {
        return true;
      }

      const cached = memberAccessCache.get(conversationId);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.allowed;
      }

      const allowed = await hasConversationAccess(
        conversationId,
        viewer.workspaceOwnerId,
        viewer.id
      );
      memberAccessCache.set(conversationId, {
        allowed,
        expiresAt: Date.now() + MEMBER_ACCESS_CACHE_TTL_MS
      });

      if (allowed) {
        allowedConversationIds.add(conversationId);
      }

      return allowed;
    }
  };
}
