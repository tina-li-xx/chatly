import { createConversationThread } from "../../../app/dashboard/use-dashboard-actions.test-helpers";
import {
  buildDashboardAiAssistPrompt,
  parseDashboardAiAssistResult,
  validateDashboardAiAssistRequest
} from "@/lib/dashboard-ai-assist";

describe("dashboard ai assist helpers", () => {
  it("validates supported actions and rewrite draft requirements", () => {
    expect(
      validateDashboardAiAssistRequest({ action: "summarize", conversationId: "conv_1" })
    ).toBeNull();
    expect(
      validateDashboardAiAssistRequest({ action: "rewrite", conversationId: "conv_1", draft: "   " })
    ).toBe("draft-required");
    expect(
      validateDashboardAiAssistRequest({ action: "rewrite", conversationId: "conv_1", draft: "Hello", tone: "invalid" })
    ).toBe("invalid-tone");
    expect(
      validateDashboardAiAssistRequest({ action: "archive", conversationId: "conv_1" })
    ).toBe("unknown-action");
  });

  it("builds prompts with conversation context and parses result payloads", () => {
    const conversation = createConversationThread({
      pageUrl: "https://example.com/pricing",
      tags: ["pricing"],
      messages: [
        {
          id: "msg_1",
          conversationId: "conv_1",
          sender: "user",
          content: "Do you charge per seat?",
          createdAt: "2026-04-02T12:00:00.000Z",
          attachments: []
        }
      ]
    });

    const prompt = buildDashboardAiAssistPrompt({
      action: "reply",
      conversation,
      savedReplies: [
        {
          id: "reply_1",
          owner_user_id: "owner_1",
          title: "Seat pricing",
          body: "We charge per seat after the included team size.",
          tags: ["pricing"],
          updated_at: "2026-04-02T12:00:00.000Z"
        }
      ]
    });

    expect(prompt).toContain("Site: Main site");
    expect(prompt).toContain("Visitor: Do you charge per seat?");
    expect(prompt).toContain("Saved replies:");
    expect(parseDashboardAiAssistResult("summarize", '{"summary":"Visitor is pricing-sensitive."}')).toEqual({
      action: "summarize",
      summary: "Visitor is pricing-sensitive."
    });
    expect(parseDashboardAiAssistResult("rewrite", '{"draft":"Short version"}', "shorter")).toEqual({
      action: "rewrite",
      draft: "Short version",
      tone: "shorter"
    });
    expect(parseDashboardAiAssistResult("tags", '{"tags":["pricing","bug"]}')).toEqual({
      action: "tags",
      tags: ["pricing", "bug"]
    });
  });
});
