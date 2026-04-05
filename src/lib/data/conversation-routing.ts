import type {
  DashboardAutomationAssignRule,
  DashboardAutomationSettings,
  DashboardAutomationTagRule
} from "@/lib/data/settings-types";
import {
  matchesRoutingCondition,
  needsVisitorRoutingProfile
} from "@/lib/conversation-routing-matchers";
import {
  findNextRoundRobinAssigneeUserId,
  insertConversationTag,
  updateConversationAssignmentRecord
} from "@/lib/repositories/conversations-repository";
import { listActiveTeamMemberRows } from "@/lib/repositories/workspace-repository";
import { optionalText } from "@/lib/utils";
import {
  loadVisitorRoutingProfile,
  type VisitorRoutingProfile
} from "@/lib/visitor-routing-profile";
import type { CreateUserMessageInput } from "./shared";

type RoutingContext = Pick<CreateUserMessageInput, "content" | "metadata"> & {
  visitorProfile: VisitorRoutingProfile;
};

async function applyAssignRule(input: {
  conversationId: string;
  ownerUserId: string;
  assignRules: DashboardAutomationAssignRule[];
  context: RoutingContext;
}) {
  const matchedRule = input.assignRules.find((rule) =>
    matchesRoutingCondition(rule.condition, rule.value, input.context)
  );
  if (!matchedRule) {
    return null;
  }

  const assignedUserId =
    matchedRule.target.type === "member"
      ? await resolveMemberTarget(input.ownerUserId, matchedRule.target.memberId)
      : (await findNextRoundRobinAssigneeUserId(input.ownerUserId)) ?? input.ownerUserId;

  await updateConversationAssignmentRecord({
    conversationId: input.conversationId,
    ownerUserId: input.ownerUserId,
    assignedUserId
  });

  return assignedUserId;
}

async function resolveMemberTarget(ownerUserId: string, memberId: string) {
  if (memberId === ownerUserId) {
    return ownerUserId;
  }

  const activeMembers = await listActiveTeamMemberRows(ownerUserId);
  return activeMembers.some((member) => member.user_id === memberId) ? memberId : ownerUserId;
}

async function applyTagRules(input: {
  conversationId: string;
  tagRules: DashboardAutomationTagRule[];
  context: RoutingContext;
}) {
  const tags = Array.from(
    new Set(
      input.tagRules
        .filter((rule) => matchesRoutingCondition(rule.condition, rule.value, input.context))
        .map((rule) => optionalText(rule.tag)?.toLowerCase())
        .filter(Boolean)
    )
  );

  await Promise.all(tags.map((tag) => insertConversationTag(input.conversationId, tag)));

  return tags;
}

export async function applyConversationAutomationRouting(input: {
  conversationId: string;
  ownerUserId: string;
  automation: DashboardAutomationSettings;
  siteId: string;
  sessionId: string;
  email?: string | null;
  content: string;
  metadata: CreateUserMessageInput["metadata"];
}) {
  const assignRules = input.automation.routing.assignRules;
  const tagRules = input.automation.routing.tagRules;
  if (!assignRules.length && !tagRules.length) {
    return { assignedUserId: null, tags: [] };
  }

  const requiresVisitorProfile = [...assignRules, ...tagRules].some((rule) =>
    needsVisitorRoutingProfile(rule.condition)
  );
  const visitorProfile = requiresVisitorProfile
    ? await loadVisitorRoutingProfile({
        siteId: input.siteId,
        sessionId: input.sessionId,
        email: input.email
      })
    : { tags: [], customFields: {} };
  const context = {
    content: input.content,
    metadata: input.metadata,
    visitorProfile
  } satisfies RoutingContext;

  const [assignedUserId, tags] = await Promise.all([
    assignRules.length
      ? applyAssignRule({
          conversationId: input.conversationId,
          ownerUserId: input.ownerUserId,
          assignRules,
          context
        })
      : Promise.resolve(null),
    tagRules.length
      ? applyTagRules({
          conversationId: input.conversationId,
          tagRules,
          context
        })
      : Promise.resolve([])
  ]);

  return {
    assignedUserId,
    tags
  };
}
