import {
  DASHBOARD_TAGS,
  errorMessageForCode,
  sortConversationSummariesByRecency,
  topTagsFromConversations
} from "./dashboard-client.utils";

describe("dashboard client utils", () => {
  it("keeps the known dashboard tags list stable", () => {
    expect(DASHBOARD_TAGS).toEqual(["pricing", "confusion", "bug", "objection"]);
  });

  it("aggregates top tags from conversations", () => {
    const tags = topTagsFromConversations([
      { tags: ["pricing", "bug", "pricing"] },
      { tags: ["confusion", "pricing"] },
      { tags: ["objection"] }
    ] as never);

    expect(tags).toEqual([
      { tag: "pricing", count: 3 },
      { tag: "bug", count: 1 },
      { tag: "confusion", count: 1 },
      { tag: "objection", count: 1 }
    ]);
  });

  it("sorts conversations by latest message time, then updated time", () => {
    const conversations = [
      { id: "older", lastMessageAt: "2026-03-31T18:00:00.000Z", updatedAt: "2026-03-31T18:00:00.000Z" },
      { id: "newer", lastMessageAt: "2026-03-31T21:49:00.000Z", updatedAt: "2026-03-31T21:49:00.000Z" },
      { id: "no-message", lastMessageAt: null, updatedAt: "2026-03-31T22:00:00.000Z" },
      { id: "tie-breaker", lastMessageAt: "2026-03-31T21:49:00.000Z", updatedAt: "2026-03-31T21:10:00.000Z" }
    ] as never;

    const sorted = sortConversationSummariesByRecency(conversations);

    expect(sorted.map((item) => item.id)).toEqual(["newer", "tie-breaker", "older", "no-message"]);
  });

  it("maps known error codes to friendly messages", () => {
    expect(errorMessageForCode("auth")).toBe("Your session expired. Sign in again.");
    expect(errorMessageForCode("ai-assist-limit-reached")).toBe(
      "The AI Assist requests included in this billing cycle have been used."
    );
    expect(errorMessageForCode("attachment-too-large")).toBe(
      "Each attachment must be smaller than 4 MB."
    );
    expect(errorMessageForCode("something-else")).toBe("Something went wrong. Try again.");
  });
});
