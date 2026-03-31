const mocks = vi.hoisted(() => ({
  sendRichEmail: vi.fn()
}));

vi.mock("@/lib/email", () => ({
  sendRichEmail: mocks.sendRichEmail
}));

import {
  sendActivationReminderEmail,
  sendExpansionReminderEmail,
  sendHealthReminderEmail
} from "@/lib/growth-outreach-email";

describe("growth outreach email", () => {
  beforeEach(() => {
    mocks.sendRichEmail.mockReset();
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
  });

  it("sends the activation reminder with widget and analytics links", async () => {
    await sendActivationReminderEmail({
      to: "owner@chatly.example",
      siteName: "Acme",
      pageUrl: "/pricing",
      mode: "live"
    });

    expect(mocks.sendRichEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@chatly.example",
        subject: "Your widget is live. Let's land the first chat today."
      })
    );
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyText).toContain("Open widget settings: https://chatly.example/dashboard/widget");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyHtml).toContain("max-width:600px");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyHtml).toContain("Open widget settings");
  });

  it("sends the health reminder with the recommended action link", async () => {
    await sendHealthReminderEmail({
      to: "owner@chatly.example",
      score: 48,
      health: {
        status: "at-risk",
        tone: "warning",
        score: 48,
        badge: "Intervene now",
        title: "Customer health score",
        description: "Conversation volume is the biggest risk right now.",
        action: { label: "Open analytics", href: "/dashboard/analytics" },
        metrics: []
      }
    });

    expect(mocks.sendRichEmail.mock.calls[0][0].subject).toBe("Your workspace health score dropped to 48");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyText).toContain("https://chatly.example/dashboard/analytics");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyHtml).toContain("max-width:600px");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyHtml).toContain("Workspace health");
  });

  it("sends the expansion reminder with billing links", async () => {
    await sendExpansionReminderEmail({
      to: "owner@chatly.example",
      planKey: "growth",
      mode: "analytics",
      usedSeats: 3,
      conversationCount: 18
    });

    expect(mocks.sendRichEmail.mock.calls[0][0].subject).toBe("You may be ready for deeper analytics and API access");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyText).toContain("https://chatly.example/dashboard/settings?section=billing");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyHtml).toContain("max-width:600px");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyHtml).toContain("Analytics growth");
    expect(mocks.sendRichEmail.mock.calls[0][0].bodyHtml).toContain("hyphens:none");
  });
});
