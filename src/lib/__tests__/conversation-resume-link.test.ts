const mocks = vi.hoisted(() => ({
  getAuthSecret: vi.fn(() => "resume-secret")
}));

vi.mock("@/lib/env.server", () => ({
  getAuthSecret: mocks.getAuthSecret
}));

import {
  buildConversationResumeLink,
  buildConversationResumeToken,
  parseConversationResumeToken
} from "@/lib/conversation-resume-link";
import {
  buildConversationPreviewLink,
  buildConversationPreviewToken,
  parseConversationPreviewToken
} from "@/lib/conversation-preview-link";

describe("conversation resume link", () => {
  it("round-trips a signed resume token", () => {
    const token = buildConversationResumeToken({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1"
    });

    expect(parseConversationResumeToken(token)).toEqual({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1"
    });
  });

  it("rejects invalid or tampered tokens", () => {
    const token = buildConversationResumeToken({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1"
    });

    expect(parseConversationResumeToken(`${token}x`)).toBeNull();
    expect(parseConversationResumeToken("not-a-token")).toBeNull();
  });

  it("builds a hosted conversation link", () => {
    const href = buildConversationResumeLink("https://chatly.example/", {
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1"
    });

    expect(href).toMatch(/^https:\/\/chatly\.example\/conversation\/.+\..+$/);
  });

  it("round-trips a preview token", () => {
    const token = buildConversationPreviewToken({
      teamName: "Acme Support",
      agentName: "Tina",
      companyName: "Acme"
    });

    expect(parseConversationPreviewToken(token)).toEqual({
      teamName: "Acme Support",
      agentName: "Tina",
      companyName: "Acme"
    });
  });

  it("builds a hosted preview link", () => {
    const href = buildConversationPreviewLink("https://chatly.example/", {
      teamName: "Acme Support",
      agentName: "Tina",
      companyName: "Acme"
    });

    expect(href).toMatch(/^https:\/\/chatly\.example\/conversation\/.+\..+$/);
  });
});
