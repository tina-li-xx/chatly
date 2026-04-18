const mocks = vi.hoisted(() => ({
  queryConversationSummaries: vi.fn()
}));

vi.mock("@/lib/repositories/shared-repository", async () => {
  const actual = await vi.importActual<typeof import("@/lib/repositories/shared-repository")>(
    "@/lib/repositories/shared-repository"
  );
  return {
    ...actual,
    queryConversationSummaries: mocks.queryConversationSummaries
  };
});

import { listZapierConversations } from "@/lib/zapier-api-resources";

describe("zapier api resources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns real conversation tags for Zapier samples", async () => {
    mocks.queryConversationSummaries.mockResolvedValueOnce({
      rows: [
        {
          id: "conv_1",
          site_id: "site_1",
          site_name: "Chatting",
          email: "visitor@example.com",
          assigned_user_id: null,
          session_id: "session_1",
          status: "open",
          created_at: "2026-04-08T10:00:00.000Z",
          updated_at: "2026-04-08T10:05:00.000Z",
          page_url: "/pricing",
          recorded_page_url: "/pricing",
          referrer: null,
          user_agent: null,
          country: null,
          region: null,
          city: null,
          timezone: null,
          locale: null,
          last_message_at: "2026-04-08T10:05:00.000Z",
          last_message_preview: "Need help with billing.",
          unread_count: "0",
          rating: null,
          tags: ["confusion", "pricing"]
        }
      ]
    });

    await expect(listZapierConversations("owner_1", 5)).resolves.toEqual([
      expect.objectContaining({
        id: "conv_1",
        visitor_email: "visitor@example.com",
        tags: ["confusion", "pricing"]
      })
    ]);
    expect(mocks.queryConversationSummaries).toHaveBeenCalledWith(
      "s.user_id = $1",
      ["owner_1"],
      "ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC LIMIT 5",
      "owner_1"
    );
  });
});
