const affiliateMocks = vi.hoisted(() => ({
  findReferralAttributionByReferredUserId: vi.fn(),
  findReferralProgramByCode: vi.fn(),
  insertReferralAttribution: vi.fn(),
  listBillingInvoiceRows: vi.fn(),
  markReferralAttributionConverted: vi.fn(),
  upsertReferralReward: vi.fn()
}));

vi.mock("@/lib/repositories/referral-repository", () => affiliateMocks);
vi.mock("@/lib/repositories/billing-repository", () => ({
  listBillingInvoiceRows: affiliateMocks.listBillingInvoiceRows
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://chatting.example"
}));

describe("affiliate referrals", () => {
  beforeEach(() => {
    Object.values(affiliateMocks).forEach((mock) => mock.mockReset());
  });

  it("creates a pending affiliate commission reward when signup attribution succeeds", async () => {
    affiliateMocks.findReferralProgramByCode.mockResolvedValue({
      id: "program_affiliate",
      owner_user_id: "user_referrer",
      code: "AFF-ABC123",
      program_type: "affiliate",
      label: "Affiliate program",
      referrer_reward_months: 0,
      referrer_reward_cents: 0,
      referred_reward_cents: 0,
      commission_bps: 2500,
      is_active: true
    });
    affiliateMocks.findReferralAttributionByReferredUserId.mockResolvedValue(null);
    affiliateMocks.insertReferralAttribution.mockResolvedValue({
      id: "attr_affiliate",
      owner_user_id: "user_referrer",
      program_type: "affiliate",
      program_label: "Affiliate program",
      commission_bps: 2500
    });

    const module = await import("@/lib/referrals");
    await module.applyReferralCodeForSignup({
      userId: "user_referred",
      email: "creator@chatting.example",
      referralCode: "aff-abc123"
    });

    expect(affiliateMocks.upsertReferralReward).toHaveBeenCalledWith(
      expect.objectContaining({
        reward_key: "attr_affiliate:signup-referrer",
        attribution_id: "attr_affiliate",
        beneficiary_user_id: "user_referrer",
        program_type: "affiliate",
        reward_kind: "commission",
        status: "pending",
        reward_cents: 0,
        commission_bps: 2500,
        source_invoice_id: null,
        source_invoice_amount_cents: null
      })
    );
  });

  it("writes earned commission ledger entries for each paid affiliate invoice", async () => {
    affiliateMocks.findReferralAttributionByReferredUserId.mockResolvedValue({
      id: "attr_affiliate",
      owner_user_id: "user_referrer",
      program_type: "affiliate",
      program_label: "Affiliate program",
      commission_bps: 2500
    });
    affiliateMocks.listBillingInvoiceRows.mockResolvedValue([
      {
        id: "in_1",
        amount_cents: 7900,
        status: "paid",
        paid_at: "2026-03-29T13:00:00.000Z",
        issued_at: "2026-03-29T12:00:00.000Z"
      },
      {
        id: "in_2",
        amount_cents: 12000,
        status: "paid",
        paid_at: "2026-04-29T13:00:00.000Z",
        issued_at: "2026-04-29T12:00:00.000Z"
      }
    ]);

    const module = await import("@/lib/referrals");
    await module.syncReferralRewardsForUser("user_referred");

    expect(affiliateMocks.markReferralAttributionConverted).toHaveBeenCalledWith(
      "attr_affiliate",
      "2026-03-29T13:00:00.000Z",
      "in_1"
    );
    expect(affiliateMocks.upsertReferralReward).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        reward_key: "attr_affiliate:signup-referrer",
        reward_kind: "commission",
        status: "earned",
        reward_cents: 1975,
        commission_bps: 2500,
        source_invoice_id: "in_1",
        source_invoice_amount_cents: 7900
      })
    );
    expect(affiliateMocks.upsertReferralReward).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        reward_key: "attr_affiliate:commission-in_2",
        reward_kind: "commission",
        status: "earned",
        reward_cents: 3000,
        commission_bps: 2500,
        source_invoice_id: "in_2",
        source_invoice_amount_cents: 12000
      })
    );
  });
});
