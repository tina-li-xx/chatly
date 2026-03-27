import {
  DASHBOARD_TAGS,
  errorMessageForCode,
  moveConversationToFront,
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

  it("moves updated conversations to the front", () => {
    const conversations = [
      { id: "a", unreadCount: 0 },
      { id: "b", unreadCount: 1 },
      { id: "c", unreadCount: 0 }
    ] as never;

    const moved = moveConversationToFront(conversations, "b", (conversation) => ({
      ...conversation,
      unreadCount: 0
    }));

    expect(moved.map((item) => item.id)).toEqual(["b", "a", "c"]);
    expect(moved[0]?.unreadCount).toBe(0);
  });

  it("maps known error codes to friendly messages", () => {
    expect(errorMessageForCode("auth")).toBe("Your session expired. Sign in again.");
    expect(errorMessageForCode("attachment-too-large")).toBe(
      "Each attachment must be smaller than 4 MB."
    );
    expect(errorMessageForCode("something-else")).toBe("Something went wrong. Try again.");
  });
});
