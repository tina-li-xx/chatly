import {
  buildConversationFeedbackLinks,
  parseConversationRating
} from "@/lib/conversation-feedback";
import {
  renderConversationFeedbackScale,
  renderConversationFeedbackText
} from "@/lib/conversation-feedback-email";

describe("conversation feedback email helpers", () => {
  it("builds five rating links and renders them in text and html", () => {
    const links = buildConversationFeedbackLinks("https://chatting.example", "conv_123");

    expect(links).toHaveLength(5);
    expect(links[0]).toEqual({
      rating: 1,
      label: "1 star",
      href: "https://chatting.example/feedback?conversationId=conv_123&rating=1"
    });
    expect(links[4]).toEqual({
      rating: 5,
      label: "5 stars",
      href: "https://chatting.example/feedback?conversationId=conv_123&rating=5"
    });

    expect(renderConversationFeedbackText(links)).toContain(
      "5 stars: https://chatting.example/feedback?conversationId=conv_123&rating=5"
    );
    expect(renderConversationFeedbackScale(links)).toContain(">5<");
  });

  it("accepts only valid 1-5 ratings", () => {
    expect(parseConversationRating("1")).toBe(1);
    expect(parseConversationRating("5")).toBe(5);
    expect(parseConversationRating("0")).toBeNull();
    expect(parseConversationRating("6")).toBeNull();
    expect(parseConversationRating("nope")).toBeNull();
  });
});
