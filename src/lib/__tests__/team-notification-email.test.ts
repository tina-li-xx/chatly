import {
  renderStarterUpgradePromptEmail,
  renderTeamNotificationUpgradePromptHtml,
  renderTeamNotificationUpgradePromptText
} from "@/lib/team-notification-email";

describe("team notification email upgrade prompt", () => {
  it("renders the early warning copy before the starter limit is hit", () => {
    const text = renderTeamNotificationUpgradePromptText({
      conversationCount: 30,
      conversationLimit: 50,
      remainingConversations: 20,
      billingUrl: "https://chatting.example/dashboard/settings?section=billing",
      limitReached: false
    });

    expect(text).toContain("Starter usage alert");
    expect(text).toContain("You're at 30 of 50 conversations this month");
    expect(text).toContain("Only 20 conversations remain");
    expect(text).toContain("Upgrade to Growth: https://chatting.example/dashboard/settings?section=billing");
  });

  it("switches to the cap-reached copy once the limit is full", () => {
    const html = renderTeamNotificationUpgradePromptHtml({
      conversationCount: 50,
      conversationLimit: 50,
      remainingConversations: 0,
      billingUrl: "https://chatting.example/dashboard/settings?section=billing",
      limitReached: true
    });

    expect(html).toContain("Starter usage alert");
    expect(html).toContain("You&#39;ve hit 50 of 50 conversations this month");
    expect(html).toContain("Upgrade to reopen chats");
    expect(html).toContain("white-space:nowrap");
    expect(html).toContain("word-break:keep-all");
  });

  it("renders the dedicated starter upgrade email with the shared Chatting shell", () => {
    const rendered = renderStarterUpgradePromptEmail({
      conversationCount: 30,
      conversationLimit: 50,
      remainingConversations: 20,
      billingUrl: "https://chatting.example/dashboard/settings?section=billing",
      limitReached: false
    });

    expect(rendered.subject).toBe("You're at 30/50 conversations this month");
    expect(rendered.bodyText).toContain("30/50 conversations this month");
    expect(rendered.bodyText).toContain(
      "You're receiving this because your workspace crossed a monthly freemium usage milestone."
    );
    expect(rendered.bodyHtml).toContain("max-width:600px");
    expect(rendered.bodyHtml).toContain("Chatting");
    expect(rendered.bodyHtml).toContain("Growth removes the monthly cap");
    expect(rendered.bodyHtml).toContain("white-space:nowrap");
  });
});
