const mocks = vi.hoisted(() => ({
  verifySlackRequestSignature: vi.fn(),
  handleSlackThreadReplyEvent: vi.fn()
}));

vi.mock("@/lib/slack-request-signing", () => ({
  verifySlackRequestSignature: mocks.verifySlackRequestSignature
}));

vi.mock("@/lib/slack-thread-replies", () => ({
  handleSlackThreadReplyEvent: mocks.handleSlackThreadReplyEvent
}));

import { POST } from "./route";

describe("slack events route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifySlackRequestSignature.mockReturnValue({ ok: true });
    mocks.handleSlackThreadReplyEvent.mockResolvedValue({ ok: true, ignored: true });
  });

  it("rejects unsigned requests", async () => {
    mocks.verifySlackRequestSignature.mockReturnValueOnce({
      ok: false,
      error: "invalid-slack-signature",
      status: 401
    });

    const response = await POST(new Request("https://usechatting.com/api/integrations/slack/events", { method: "POST", body: "{}" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "invalid-slack-signature" });
  });

  it("responds to url verification challenges", async () => {
    const response = await POST(
      new Request("https://usechatting.com/api/integrations/slack/events", {
        method: "POST",
        body: JSON.stringify({ type: "url_verification", challenge: "abc123" })
      })
    );

    expect(await response.json()).toEqual({ challenge: "abc123" });
    expect(mocks.handleSlackThreadReplyEvent).not.toHaveBeenCalled();
  });

  it("passes event callbacks to the slack thread reply handler", async () => {
    mocks.handleSlackThreadReplyEvent.mockResolvedValueOnce({
      ok: true,
      conversationId: "conv_1",
      messageId: "msg_1"
    });

    const response = await POST(
      new Request("https://usechatting.com/api/integrations/slack/events", {
        method: "POST",
        body: JSON.stringify({ type: "event_callback", team_id: "T123", event: { type: "message" } })
      })
    );

    expect(mocks.handleSlackThreadReplyEvent).toHaveBeenCalledWith({
      type: "event_callback",
      team_id: "T123",
      event: { type: "message" }
    });
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      messageId: "msg_1"
    });
  });
});
