import {
  STARTER_MONTHLY_CONVERSATION_LIMIT,
  STARTER_UPGRADE_PROMPT_CONVERSATION_THRESHOLD,
  getStarterConversationUsage,
  shouldSendStarterUpgradeEmail
} from "@/lib/freemium";

describe("freemium usage", () => {
  it("waits until 30 monthly conversations before showing the upgrade prompt", () => {
    const usage = getStarterConversationUsage(29);

    expect(usage.conversationLimit).toBe(STARTER_MONTHLY_CONVERSATION_LIMIT);
    expect(usage.upgradePromptThreshold).toBe(STARTER_UPGRADE_PROMPT_CONVERSATION_THRESHOLD);
    expect(usage.shouldShowUpgradePrompt).toBe(false);
    expect(usage.conversationsUntilUpgradePrompt).toBe(1);
    expect(usage.remainingConversations).toBe(21);
  });

  it("activates the prompt and tracks remaining conversations once the threshold is crossed", () => {
    const usage = getStarterConversationUsage(30);

    expect(usage.shouldShowUpgradePrompt).toBe(true);
    expect(usage.conversationsUntilUpgradePrompt).toBe(0);
    expect(usage.remainingConversations).toBe(20);
    expect(usage.limitReached).toBe(false);
  });

  it("caps usage at the monthly limit", () => {
    const usage = getStarterConversationUsage(55);

    expect(usage.conversationUsagePercent).toBe(100);
    expect(usage.remainingConversations).toBe(0);
    expect(usage.limitReached).toBe(true);
  });

  it("only sends dedicated billing emails at the 30 and 50 conversation milestones", () => {
    expect(shouldSendStarterUpgradeEmail(29)).toBe(false);
    expect(shouldSendStarterUpgradeEmail(30)).toBe(true);
    expect(shouldSendStarterUpgradeEmail(31)).toBe(false);
    expect(shouldSendStarterUpgradeEmail(49)).toBe(false);
    expect(shouldSendStarterUpgradeEmail(50)).toBe(true);
  });
});
