const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import { listFounderRecentConversationRows } from "@/lib/repositories/founder-switchboard-repository";

describe("founder switchboard repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads recent conversations from recorded page snapshots", async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [{ conversation_id: "conv_1", page_url: "/pricing", first_message_preview: "Hello" }]
    });

    await expect(listFounderRecentConversationRows(5)).resolves.toEqual([
      { conversation_id: "conv_1", page_url: "/pricing", first_message_preview: "Hello" }
    ]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("c.recorded_page_url AS page_url");
    expect(mocks.query.mock.calls[0]?.[0]).not.toContain("LEFT JOIN conversation_metadata cm");
    expect(mocks.query.mock.calls[0]?.[0]).toContain("LEFT JOIN LATERAL");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual([5]);
  });
});
