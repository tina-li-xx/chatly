const mocks = vi.hoisted(() => ({
  buildDashboardEmailTemplatePreviewContext: vi.fn(),
  buildConversationFeedbackLinks: vi.fn(),
  buildConversationTranscriptPreviewMessages: vi.fn(),
  displayNameFromEmail: vi.fn(),
  getDashboardSettingsData: vi.fn(),
  getPublicAppUrl: vi.fn(),
  renderConversationTranscriptEmailTemplate: vi.fn(),
  renderVisitorConversationEmailTemplate: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  sendSettingsTemplateTestEmail: vi.fn(),
  shouldShowTranscriptViralFooter: vi.fn()
}));

vi.mock("@/lib/email-templates", () => ({
  buildDashboardEmailTemplatePreviewContext: mocks.buildDashboardEmailTemplatePreviewContext
}));
vi.mock("@/lib/conversation-feedback", () => ({
  buildConversationFeedbackLinks: mocks.buildConversationFeedbackLinks
}));
vi.mock("@/lib/conversation-transcript-email", () => ({
  buildConversationTranscriptPreviewMessages: mocks.buildConversationTranscriptPreviewMessages,
  renderConversationTranscriptEmailTemplate: mocks.renderConversationTranscriptEmailTemplate
}));
vi.mock("@/lib/conversation-transcript-footer", () => ({
  shouldShowTranscriptViralFooter: mocks.shouldShowTranscriptViralFooter
}));
vi.mock("@/lib/conversation-visitor-email", () => ({
  renderVisitorConversationEmailTemplate: mocks.renderVisitorConversationEmailTemplate
}));
vi.mock("@/lib/data", () => ({
  getDashboardSettingsData: mocks.getDashboardSettingsData
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));
vi.mock("@/lib/email", () => ({
  sendSettingsTemplateTestEmail: mocks.sendSettingsTemplateTestEmail
}));
vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) => Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));
vi.mock("@/lib/user-display", () => ({
  displayNameFromEmail: mocks.displayNameFromEmail
}));

import { POST } from "./route";

describe("settings email template test route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({ user: { id: "user_1" } });
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.getDashboardSettingsData.mockResolvedValue({
      profile: {
        firstName: "Tina",
        lastName: "Bauer",
        email: "tina@example.com",
        avatarDataUrl: "data:image/png;base64,abc"
      },
      email: { replyToEmail: "reply@example.com" },
      billing: { planKey: "growth" }
    });
    mocks.buildDashboardEmailTemplatePreviewContext.mockReturnValue({
      conversationLink: "https://workspace.example/conversations/preview"
    });
    mocks.buildConversationTranscriptPreviewMessages.mockReturnValue([{ id: "message_1" }]);
    mocks.shouldShowTranscriptViralFooter.mockReturnValue(true);
    mocks.renderConversationTranscriptEmailTemplate.mockReturnValue({
      subject: "Transcript preview",
      bodyText: "Body text",
      bodyHtml: "<p>Transcript</p>"
    });
    mocks.renderVisitorConversationEmailTemplate.mockReturnValue({
      subject: "Visitor preview",
      bodyText: "Visitor body",
      bodyHtml: "<p>Visitor</p>"
    });
    mocks.buildConversationFeedbackLinks.mockReturnValue({ helpful: "yes", notHelpful: "no" });
  });

  it("returns auth failures from requireJsonRouteUser", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await POST(new Request("https://chatting.test", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("rejects missing fields before rendering", async () => {
    const response = await POST(new Request("https://chatting.test", { method: "POST", body: JSON.stringify({}) }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-template-fields" });
  });

  it("renders and sends transcript previews", async () => {
    const response = await POST(new Request("https://chatting.test", {
      method: "POST",
      body: JSON.stringify({
        key: "conversation_transcript",
        subject: "Subject",
        body: "Body",
        notificationEmail: "dest@example.com"
      })
    }));

    expect(response.status).toBe(200);
    expect(mocks.buildDashboardEmailTemplatePreviewContext).toHaveBeenCalledWith({
      profileEmail: "tina@example.com",
      profileName: "Tina Bauer",
      appUrl: "https://usechatting.com"
    });
    expect(mocks.renderConversationTranscriptEmailTemplate).toHaveBeenCalled();
    expect(mocks.sendSettingsTemplateTestEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "dest@example.com", subject: "Transcript preview" })
    );
  });

  it("maps unexpected failures to a stable error", async () => {
    mocks.getDashboardSettingsData.mockRejectedValueOnce(new Error("boom"));

    const response = await POST(new Request("https://chatting.test", {
      method: "POST",
      body: JSON.stringify({
        key: "visitor_missed",
        subject: "Subject",
        body: "Body",
        notificationEmail: "dest@example.com"
      })
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "email-template-test-failed" });
  });
});
