const mocks = vi.hoisted(() => ({
  getDashboardAiAssistBillingCycle: vi.fn(),
  getWorkspaceAiAssistUsageSnapshotRow: vi.fn()
}));

vi.mock("@/lib/data/dashboard-ai-assist-billing-cycle", () => ({
  getDashboardAiAssistBillingCycle: mocks.getDashboardAiAssistBillingCycle
}));
vi.mock("@/lib/repositories/ai-assist-usage-snapshot-repository", () => ({
  getWorkspaceAiAssistUsageSnapshotRow: mocks.getWorkspaceAiAssistUsageSnapshotRow
}));

import { getDashboardAiAssistUsage } from "@/lib/data/settings-ai-assist-usage-read";

describe("settings ai assist usage read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDashboardAiAssistBillingCycle.mockResolvedValue({
      planKey: "growth",
      limit: 2000,
      startIso: "2026-04-01T00:00:00.000Z",
      nextIso: "2026-05-01T00:00:00.000Z",
      previousStartIso: "2026-03-01T00:00:00.000Z",
      label: "April 2026"
    });
    mocks.getWorkspaceAiAssistUsageSnapshotRow.mockResolvedValue({
      current_requests: "9",
      current_suggestion_requests: "6",
      current_used: "4",
      current_summaries: "3",
      current_reply_requests: "2",
      current_summary_requests: "3",
      current_rewrite_requests: "2",
      current_tag_requests: "2",
      current_active_teammates: "2",
      current_last_event_at: "2026-04-06T11:00:00.000Z",
      previous_requests: "3",
      previous_suggestion_requests: "2",
      previous_used: "1",
      previous_summaries: "1",
      team_rows: [
        {
          actor_user_id: "user_1",
          actor_email: "alex@example.com",
          requests: "5",
          suggestion_requests: "3",
          used: "2",
          summaries: "2"
        },
        {
          actor_user_id: "user_2",
          actor_email: "sam@example.com",
          requests: "4",
          suggestion_requests: "3",
          used: "2",
          summaries: "1"
        }
      ],
      activity_rows: [
        {
          id: "event_1",
          actor_user_id: "user_1",
          actor_email: "alex@example.com",
          conversation_id: "conv_1",
          conversation_preview: "Question about pricing for the Growth plan",
          feature: "rewrite",
          action: "applied",
          metadata_json: { tone: "formal" },
          created_at: "2026-04-06T11:00:00.000Z"
        }
      ]
    });
  });

  it("builds a growth usage snapshot for admins", async () => {
    const result = await getDashboardAiAssistUsage({
      ownerUserId: "owner_1",
      viewerUserId: "user_1",
      viewerRole: "admin",
      now: new Date("2026-04-06T12:00:00.000Z")
    });

    expect(result.monthLabel).toBe("April 2026");
    expect(result.viewerCanSeeTeamUsage).toBe(true);
    expect(result.meter).toEqual({
      planKey: "growth",
      limit: 2000,
      used: 9,
      remaining: 1991,
      percentUsed: 0,
      resetsAt: "2026-05-01T00:00:00.000Z",
      state: "normal"
    });
    expect(result.overview).toEqual({
      requests: 9,
      used: 4,
      acceptanceRate: 67,
      summaries: 3,
      requestedByFeature: {
        summary: 3,
        reply: 2,
        rewrite: 2,
        tags: 2
      }
    });
    expect(result.viewer).toEqual({
      requests: 5,
      used: 2,
      acceptanceRate: 67,
      teamSharePercent: 56
    });
    expect(result.teamMembers).toHaveLength(2);
    expect(result.activity).toEqual([
      {
        id: "event_1",
        actorEmail: "alex@example.com",
        actorLabel: "Alex",
        actorUserId: "user_1",
        feature: "rewrite",
        action: "applied",
        conversationId: "conv_1",
        conversationPreview: "Question about pricing for the Growth plan",
        createdAt: "2026-04-06T11:00:00.000Z",
        tone: "formal",
        tag: null,
        edited: false,
        editLevel: null
      }
    ]);
  });

  it("filters team rows and activity to the current member", async () => {
    const result = await getDashboardAiAssistUsage({
      ownerUserId: "owner_1",
      viewerUserId: "user_2",
      viewerRole: "member",
      now: new Date("2026-04-06T12:00:00.000Z")
    });

    expect(mocks.getWorkspaceAiAssistUsageSnapshotRow).toHaveBeenCalledWith(
      expect.objectContaining({
        activityActorUserId: "user_2",
        teamActorUserId: "user_2"
      })
    );
    expect(result.viewerCanSeeTeamUsage).toBe(false);
    expect(result.teamMembers).toEqual([]);
    expect(result.viewer.requests).toBe(4);
    expect(result.viewer.teamSharePercent).toBeNull();
  });
});
