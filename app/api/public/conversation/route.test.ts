const mocks = vi.hoisted(() => ({
  getPublicConversationState: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getPublicConversationState: mocks.getPublicConversationState
}));

import { GET, OPTIONS } from "./route";

describe("public conversation route", () => {
  it("returns the CORS preflight response", async () => {
    const response = OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("requires the full conversation identity", async () => {
    const response = await GET(new Request("http://localhost/api/public/conversation?siteId=site_1"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId, sessionId, and conversationId are required." });
  });

  it("returns not found when the conversation does not exist", async () => {
    mocks.getPublicConversationState.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/api/public/conversation?siteId=site_1&sessionId=session_1&conversationId=conv_1")
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Conversation not found." });
  });

  it("returns the conversation thread and maps team messages to team", async () => {
    mocks.getPublicConversationState.mockResolvedValueOnce({
      messages: [
        {
          id: "msg_1",
          content: "Hi there",
          createdAt: "2026-03-29T10:00:00.000Z",
          sender: "user",
          attachments: []
        },
        {
          id: "msg_2",
          content: "Happy to help",
          createdAt: "2026-03-29T10:01:00.000Z",
          sender: "team",
          attachments: []
        }
      ],
      faqSuggestions: {
        fallbackMessage: "None of these help? A team member will be with you shortly.",
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ]
      }
    });

    const response = await GET(
      new Request("http://localhost/api/public/conversation?siteId=site_1&sessionId=session_1&conversationId=conv_1")
    );

    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      messages: [
        { id: "msg_1", content: "Hi there", createdAt: "2026-03-29T10:00:00.000Z", sender: "user", attachments: [] },
        { id: "msg_2", content: "Happy to help", createdAt: "2026-03-29T10:01:00.000Z", sender: "team", attachments: [] }
      ],
      faqSuggestions: {
        fallbackMessage: "None of these help? A team member will be with you shortly.",
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ]
      }
    });
  });
});
