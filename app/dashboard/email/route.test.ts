const mocks = vi.hoisted(() => ({
  updateConversationEmail: vi.fn(),
  sendWelcomeTemplateEmail: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  updateConversationEmail: mocks.updateConversationEmail
}));

vi.mock("@/lib/conversation-template-emails", () => ({
  sendWelcomeTemplateEmail: mocks.sendWelcomeTemplateEmail
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard email route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatting.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("rejects missing fields", async () => {
    const formData = new FormData();
    const response = await POST(
      new Request("http://localhost/dashboard/email", { method: "POST", body: formData })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the conversation email cannot be updated", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_404");
    formData.set("email", "visitor@example.com");
    mocks.updateConversationEmail.mockResolvedValueOnce({ updated: false, welcomeEmailEligible: false });

    const response = await POST(
      new Request("http://localhost/dashboard/email", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("sends the welcome template when the conversation becomes eligible", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("email", "visitor@example.com");
    mocks.updateConversationEmail.mockResolvedValueOnce({ updated: true, welcomeEmailEligible: true });

    const response = await POST(
      new Request("http://localhost/dashboard/email", { method: "POST", body: formData })
    );

    expect(mocks.sendWelcomeTemplateEmail).toHaveBeenCalledWith({
      conversationId: "conv_1",
      userId: "user_123"
    });
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      email: "visitor@example.com"
    });
  });

  it("returns success even when the welcome template send fails", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("email", "visitor@example.com");
    mocks.updateConversationEmail.mockResolvedValueOnce({ updated: true, welcomeEmailEligible: true });
    mocks.sendWelcomeTemplateEmail.mockRejectedValueOnce(new Error("mail down"));

    const response = await POST(
      new Request("http://localhost/dashboard/email", { method: "POST", body: formData })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      email: "visitor@example.com"
    });
  });
});
