const mocks = vi.hoisted(() => ({
  ensureDefaultReferralPrograms: vi.fn()
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://chatly.example"
}));

vi.mock("@/lib/referrals", () => ({
  ensureDefaultReferralPrograms: mocks.ensureDefaultReferralPrograms
}));

describe("widget branding attribution", () => {
  beforeEach(() => {
    mocks.ensureDefaultReferralPrograms.mockReset();
  });

  it("uses the customer referral code and adds widget attribution params", async () => {
    mocks.ensureDefaultReferralPrograms.mockResolvedValueOnce([
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
      }
    ]);

    const { getWidgetBrandingAttributionUrl } = await import("@/lib/widget-branding-attribution");
    const url = await getWidgetBrandingAttributionUrl("user_123", "site_123");

    expect(url).toBe(
      "https://chatly.example/signup?ref=REF-ABC123&utm_source=widget_branding&utm_medium=powered_by&utm_campaign=site_123"
    );
  });

  it("falls back to signup with attribution params when no referral programs are active", async () => {
    mocks.ensureDefaultReferralPrograms.mockResolvedValueOnce([]);

    const { getWidgetBrandingAttributionUrl } = await import("@/lib/widget-branding-attribution");
    const url = await getWidgetBrandingAttributionUrl("user_123", "site_456");

    expect(url).toBe(
      "https://chatly.example/signup?utm_source=widget_branding&utm_medium=powered_by&utm_campaign=site_456"
    );
  });
});
