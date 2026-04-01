const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/db", () => ({ query: mocks.query }));

import {
  getDashboardHomeOverview,
  getDashboardHomeResponseMetrics,
  getDashboardHomeSatisfactionMetrics,
  getDashboardHomeConversationRange
} from "@/lib/repositories/dashboard-home-repository";
import {
  findReferralAttributionByReferredUserId,
  findReferralProgramByCode,
  insertReferralAttribution,
  insertReferralProgram,
  listReferralAttributionsByOwnerUserId,
  listReferralProgramsByOwnerUserId,
  listReferralRewardsByAttributionId,
  listReferralRewardsByBeneficiaryUserId,
  markReferralAttributionConverted,
  upsertReferralReward
} from "@/lib/repositories/referral-repository";

describe("dashboard home and referral repositories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads dashboard home overview, metrics, chart points, and previous totals", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ open_conversations: "2", opened_today: "3", resolved_today: "1", resolved_yesterday: "4" }] })
      .mockResolvedValueOnce({ rows: [{ current_avg_seconds: "45", previous_avg_seconds: "60" }] })
      .mockResolvedValueOnce({ rows: [{ current_rate: "96", previous_rate: "90" }] })
      .mockResolvedValueOnce({
        rows: [{ day_key: "2026-03-31", day_label: "Mon", count: "4", previous_total: "8" }]
      });

    await expect(getDashboardHomeOverview("user_1")).resolves.toEqual({ open_conversations: "2", opened_today: "3", resolved_today: "1", resolved_yesterday: "4" });
    await expect(getDashboardHomeResponseMetrics("user_1")).resolves.toEqual({ current_avg_seconds: "45", previous_avg_seconds: "60" });
    await expect(getDashboardHomeSatisfactionMetrics("user_1")).resolves.toEqual({ current_rate: "96", previous_rate: "90" });
    await expect(getDashboardHomeConversationRange("user_1", "Europe/London", 30)).resolves.toEqual({
      previousTotal: 8,
      rows: [{ dayKey: "2026-03-31", dayLabel: "Mon", count: "4" }]
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("resolved_yesterday");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("AT TIME ZONE $2");
    expect(mocks.query.mock.calls[3]?.[1]).toEqual(["user_1", "Europe/London", 30]);
  });

  it("reads, writes, and updates referral programs, attributions, and rewards", async () => {
    mocks.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "program_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "program_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "program_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "attribution_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "attribution_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "attribution_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "reward_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "reward_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "reward_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "reward_1" }] });

    await expect(listReferralProgramsByOwnerUserId("user_1")).resolves.toEqual([{ id: "program_1" }]);
    await expect(insertReferralProgram({ id: "program_1", owner_user_id: "user_1", code: "REF-123", program_type: "customer", label: "Customers", referrer_reward_months: 1, referrer_reward_cents: 0, referred_reward_cents: 0, commission_bps: 0, is_active: true })).resolves.toEqual({ id: "program_1" });
    await expect(findReferralProgramByCode("REF-123")).resolves.toEqual({ id: "program_1" });
    await expect(insertReferralAttribution({ id: "attribution_1", program_id: "program_1", owner_user_id: "user_1", referred_user_id: "user_2", referred_email: "hello@example.com", code: "REF-123", program_type: "customer", program_label: "Customers", referrer_reward_months: 1, referrer_reward_cents: 0, referred_reward_cents: 0, commission_bps: 0 })).resolves.toEqual({ id: "attribution_1" });
    await expect(findReferralAttributionByReferredUserId("user_2")).resolves.toEqual({ id: "attribution_1" });
    await listReferralAttributionsByOwnerUserId("user_1");
    await markReferralAttributionConverted("attribution_1", "2026-03-29T10:00:00.000Z", "invoice_1");
    await expect(upsertReferralReward({ id: "reward_1", reward_key: "reward-key", attribution_id: "attribution_1", beneficiary_user_id: "user_1", program_type: "customer", program_label: "Customers", reward_role: "referrer", reward_kind: "free_month", status: "earned", description: "Reward", reward_months: 1, reward_cents: 0, commission_bps: 0, source_invoice_id: "invoice_1", source_invoice_amount_cents: 2900, earned_at: "2026-03-29T10:00:00.000Z" })).resolves.toEqual({ id: "reward_1" });
    await expect(listReferralRewardsByBeneficiaryUserId("user_1")).resolves.toEqual([{ id: "reward_1" }]);
    await expect(listReferralRewardsByAttributionId("attribution_1")).resolves.toEqual([{ id: "reward_1" }]);

    expect(mocks.query.mock.calls[1]?.[0]).toContain("ON CONFLICT (owner_user_id, program_type) DO NOTHING");
    expect(mocks.query.mock.calls[6]?.[0]).toContain("UPDATE referral_attributions");
    expect(mocks.query.mock.calls[7]?.[0]).toContain("ON CONFLICT (reward_key) DO UPDATE");
  });
});
