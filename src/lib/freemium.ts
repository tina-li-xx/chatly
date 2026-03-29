export const STARTER_MONTHLY_CONVERSATION_LIMIT = 50;
export const STARTER_UPGRADE_PROMPT_CONVERSATION_THRESHOLD = 30;

export type StarterConversationUsage = {
  conversationCount: number;
  conversationLimit: number;
  remainingConversations: number;
  conversationUsagePercent: number;
  upgradePromptThreshold: number;
  conversationsUntilUpgradePrompt: number;
  limitReached: boolean;
  shouldShowUpgradePrompt: boolean;
};

export function shouldSendStarterUpgradeEmail(conversationCount: number) {
  const usage = getStarterConversationUsage(conversationCount);
  return (
    usage.conversationCount === usage.upgradePromptThreshold ||
    usage.conversationCount === usage.conversationLimit
  );
}

export function getStarterConversationUsage(conversationCount: number): StarterConversationUsage {
  const safeConversationCount = Number.isFinite(conversationCount) ? Math.max(0, Math.floor(conversationCount)) : 0;
  const remainingConversations = Math.max(0, STARTER_MONTHLY_CONVERSATION_LIMIT - safeConversationCount);
  const conversationsUntilUpgradePrompt = Math.max(
    0,
    STARTER_UPGRADE_PROMPT_CONVERSATION_THRESHOLD - safeConversationCount
  );

  return {
    conversationCount: safeConversationCount,
    conversationLimit: STARTER_MONTHLY_CONVERSATION_LIMIT,
    remainingConversations,
    conversationUsagePercent: Math.min(
      100,
      (safeConversationCount / STARTER_MONTHLY_CONVERSATION_LIMIT) * 100
    ),
    upgradePromptThreshold: STARTER_UPGRADE_PROMPT_CONVERSATION_THRESHOLD,
    conversationsUntilUpgradePrompt,
    limitReached: safeConversationCount >= STARTER_MONTHLY_CONVERSATION_LIMIT,
    shouldShowUpgradePrompt: safeConversationCount >= STARTER_UPGRADE_PROMPT_CONVERSATION_THRESHOLD
  };
}
