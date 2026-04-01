const mocks = vi.hoisted(() => ({
  renderStarterUpgradePromptEmail: vi.fn(),
  sendRichEmail: vi.fn()
}));

vi.mock("@/lib/email", () => ({
  sendRichEmail: mocks.sendRichEmail
}));

vi.mock("@/lib/team-notification-email", () => ({
  renderStarterUpgradePromptEmail: mocks.renderStarterUpgradePromptEmail
}));

import { sendStarterUpgradePromptEmail } from "@/lib/billing-upgrade-email";

describe("billing email helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upgrade prompt emails before sending them", async () => {
    mocks.renderStarterUpgradePromptEmail.mockReturnValue({
      subject: "Upgrade now",
      bodyText: "Text body",
      bodyHtml: "<p>HTML body</p>"
    });

    await sendStarterUpgradePromptEmail({
      to: "owner@example.com",
      prompt: { conversationCount: 50, conversationLimit: 50, remainingConversations: 0, billingUrl: "https://usechatting.com", limitReached: true }
    });

    expect(mocks.sendRichEmail).toHaveBeenCalledWith({
      from: "Chatting <hello@usechatting.com>",
      to: "owner@example.com",
      subject: "Upgrade now",
      bodyText: "Text body",
      bodyHtml: "<p>HTML body</p>"
    });
  });
});
