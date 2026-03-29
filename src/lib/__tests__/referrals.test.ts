const referralMocks = vi.hoisted(() => ({
  findReferralAttributionByReferredUserId: vi.fn(),
  findReferralProgramByCode: vi.fn(),
  insertReferralAttribution: vi.fn(),
  insertReferralProgram: vi.fn(),
  listReferralAttributionsByOwnerUserId: vi.fn(),
  listReferralProgramsByOwnerUserId: vi.fn(),
  listReferralRewardsByAttributionId: vi.fn(),
  listReferralRewardsByBeneficiaryUserId: vi.fn(),
  markReferralAttributionConverted: vi.fn(),
  upsertReferralReward: vi.fn(),
  listBillingInvoiceRows: vi.fn()
}));

vi.mock("@/lib/repositories/referral-repository", () => referralMocks);
vi.mock("@/lib/repositories/billing-repository", () => ({
  listBillingInvoiceRows: referralMocks.listBillingInvoiceRows
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://chatly.example"
}));

describe("referrals", () => {
  beforeEach(() => {
    Object.values(referralMocks).forEach((mock) => mock.mockReset());
  });

  it("normalizes referral codes for manual entry and query params", async () => {
    const module = await import("@/lib/referrals");
    expect(module.normalizeReferralCode("  aff-12 3x  ")).toBe("AFF-123X");
  });

  it("builds dashboard referral summaries with share links and totals", async () => {
    referralMocks.listReferralProgramsByOwnerUserId.mockResolvedValue([
      {
        id: "program_customer",
        owner_user_id: "user_123",
        code: "REF-ABC123",
        program_type: "customer",
        label: "Customer referrals",
        referrer_reward_months: 1,
        referrer_reward_cents: 0,
        referred_reward_cents: 0,
        commission_bps: 0,
        is_active: true,
        created_at: "2026-03-29T10:00:00.000Z",
        updated_at: "2026-03-29T10:00:00.000Z"
      },
      {
        id: "program_affiliate",
        owner_user_id: "user_123",
        code: "AFF-ABC123",
        program_type: "affiliate",
        label: "Affiliate program",
        referrer_reward_months: 0,
        referrer_reward_cents: 0,
        referred_reward_cents: 0,
        commission_bps: 2500,
        is_active: true,
        created_at: "2026-03-29T10:00:00.000Z",
        updated_at: "2026-03-29T10:00:00.000Z"
      },
      {
        id: "program_mutual",
        owner_user_id: "user_123",
        code: "GIVE-ABC123",
        program_type: "mutual",
        label: "Give $10, get $10",
        referrer_reward_months: 0,
        referrer_reward_cents: 1000,
        referred_reward_cents: 1000,
        commission_bps: 0,
        is_active: true,
        created_at: "2026-03-29T10:00:00.000Z",
        updated_at: "2026-03-29T10:00:00.000Z"
      }
    ]);
    referralMocks.listReferralAttributionsByOwnerUserId.mockResolvedValue([
      {
        id: "attr_1",
        program_id: "program_customer",
        owner_user_id: "user_123",
        referred_user_id: "user_456",
        referred_email: "new@chatly.example",
        code: "REF-ABC123",
        program_type: "customer",
        program_label: "Customer referrals",
        referrer_reward_months: 1,
        referrer_reward_cents: 0,
        referred_reward_cents: 0,
        commission_bps: 0,
        converted_to_paid_at: "2026-03-29T12:00:00.000Z",
        first_paid_invoice_id: "in_123",
        created_at: "2026-03-29T11:00:00.000Z",
        updated_at: "2026-03-29T12:00:00.000Z"
      }
    ]);
    referralMocks.listReferralRewardsByBeneficiaryUserId.mockResolvedValue([
      {
        id: "reward_1",
        reward_key: "attr_1:signup-referrer",
        attribution_id: "attr_1",
        beneficiary_user_id: "user_123",
        program_type: "affiliate",
        program_label: "Affiliate program",
        reward_role: "referrer",
        reward_kind: "commission",
        status: "earned",
        description: "Recurring affiliate commission earned.",
        reward_months: 0,
        reward_cents: 1975,
        commission_bps: 2500,
        source_invoice_id: "in_123",
        source_invoice_amount_cents: 7900,
        created_at: "2026-03-29T11:00:00.000Z",
        earned_at: "2026-03-29T12:00:00.000Z"
      }
    ]);

    const module = await import("@/lib/referrals");
    const summary = await module.getDashboardReferralSummary("user_123");

    expect(summary.programs[0]?.shareUrl).toBe("https://chatly.example/signup?ref=REF-ABC123");
    expect(summary.attributedSignups[0]?.status).toBe("converted");
    expect(summary.earnedCommissionCents).toBe(1975);
  });

  it("earns pending mutual rewards after the first paid invoice", async () => {
    referralMocks.findReferralAttributionByReferredUserId.mockResolvedValue({
      id: "attr_mutual",
      program_id: "program_mutual",
      owner_user_id: "user_referrer",
      referred_user_id: "user_referred",
      referred_email: "new@chatly.example",
      code: "GIVE-ABC123",
      program_type: "mutual",
      program_label: "Give $10, get $10",
      referrer_reward_months: 0,
      referrer_reward_cents: 1000,
      referred_reward_cents: 1000,
      commission_bps: 0,
      converted_to_paid_at: null,
      first_paid_invoice_id: null,
      created_at: "2026-03-29T11:00:00.000Z",
      updated_at: "2026-03-29T11:00:00.000Z"
    });
    referralMocks.listBillingInvoiceRows.mockResolvedValue([
      {
        id: "in_paid",
        amount_cents: 7900,
        status: "paid",
        paid_at: "2026-03-29T13:00:00.000Z",
        issued_at: "2026-03-29T12:00:00.000Z"
      }
    ]);
    referralMocks.listReferralRewardsByAttributionId.mockResolvedValue([
      {
        id: "reward_pending",
        reward_key: "attr_mutual:signup-referrer",
        attribution_id: "attr_mutual",
        beneficiary_user_id: "user_referrer",
        program_type: "mutual",
        program_label: "Give $10, get $10",
        reward_role: "referrer",
        reward_kind: "discount_credit",
        status: "pending",
        description: "Pending reward",
        reward_months: 0,
        reward_cents: 1000,
        commission_bps: 0,
        source_invoice_id: null,
        source_invoice_amount_cents: null,
        created_at: "2026-03-29T11:00:00.000Z",
        earned_at: null
      }
    ]);

    const module = await import("@/lib/referrals");
    await module.syncReferralRewardsForUser("user_referred");

    expect(referralMocks.markReferralAttributionConverted).toHaveBeenCalledWith(
      "attr_mutual",
      "2026-03-29T13:00:00.000Z",
      "in_paid"
    );
    expect(referralMocks.upsertReferralReward).toHaveBeenCalled();
  });
});
