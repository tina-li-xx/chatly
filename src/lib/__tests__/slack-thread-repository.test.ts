const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  findSlackThreadByConversationId,
  findSlackThreadByThreadKey,
  upsertSlackThreadRow
} from "@/lib/repositories/slack-thread-repository";

describe("slack thread repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds and upserts mapped slack threads", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ conversation_id: "conv_1" }] })
      .mockResolvedValueOnce({ rows: [{ conversation_id: "conv_1" }] })
      .mockResolvedValueOnce({ rows: [{ conversation_id: "conv_1", slack_thread_ts: "171.0001" }] });

    await expect(findSlackThreadByConversationId("conv_1")).resolves.toEqual({ conversation_id: "conv_1" });
    await expect(
      findSlackThreadByThreadKey({
        slackTeamId: "T123",
        slackChannelId: "C123",
        slackThreadTs: "171.0001"
      })
    ).resolves.toEqual({ conversation_id: "conv_1" });
    await expect(
      upsertSlackThreadRow({
        conversationId: "conv_1",
        ownerUserId: "owner_1",
        slackTeamId: "T123",
        slackChannelId: "C123",
        slackChannelName: "#support",
        slackMessageTs: "171.0001",
        slackThreadTs: "171.0001"
      })
    ).resolves.toEqual({ conversation_id: "conv_1", slack_thread_ts: "171.0001" });

    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["T123", "C123", "171.0001"]);
    expect(mocks.query.mock.calls[2]?.[0]).toContain("INSERT INTO workspace_slack_threads");
  });
});
