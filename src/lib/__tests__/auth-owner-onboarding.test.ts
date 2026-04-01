const mocks = vi.hoisted(() => ({
  applyReferralCodeForSignup: vi.fn(),
  completeUserOwnerOnboarding: vi.fn(),
  createSiteForUser: vi.fn(),
  ensureOwnerGrowthTrialBillingAccount: vi.fn(),
  findAuthUserById: vi.fn(),
  listSitesForUser: vi.fn(),
  updateUserOwnerOnboardingStage: vi.fn()
}));

vi.mock("@/lib/billing-default-account", () => ({
  ensureOwnerGrowthTrialBillingAccount: mocks.ensureOwnerGrowthTrialBillingAccount
}));
vi.mock("@/lib/data/sites", () => ({
  createSiteForUser: mocks.createSiteForUser,
  listSitesForUser: mocks.listSitesForUser
}));
vi.mock("@/lib/repositories/auth-owner-onboarding-repository", () => ({
  completeUserOwnerOnboarding: mocks.completeUserOwnerOnboarding,
  updateUserOwnerOnboardingStage: mocks.updateUserOwnerOnboardingStage
}));
vi.mock("@/lib/repositories/auth-repository", () => ({
  findAuthUserById: mocks.findAuthUserById
}));
vi.mock("@/lib/referrals", () => ({
  applyReferralCodeForSignup: mocks.applyReferralCodeForSignup,
  normalizeReferralCode: (value?: string | null) => value?.trim().toUpperCase() || null
}));

import { resumeOwnerOnboardingForUser } from "@/lib/auth-owner-onboarding";

describe("auth owner onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the missing site, ensures billing, and completes setup without a referral code", async () => {
    mocks.findAuthUserById.mockResolvedValue({
      id: "user_1",
      email: "owner@acme.com",
      owner_onboarding_stage: "account_created",
      owner_onboarding_site_domain: "https://acme.com",
      owner_onboarding_referral_code: null
    });
    mocks.listSitesForUser.mockResolvedValueOnce([]);
    mocks.createSiteForUser.mockResolvedValue({ id: "site_1" });
    mocks.updateUserOwnerOnboardingStage
      .mockResolvedValueOnce({ owner_onboarding_stage: "site_created" })
      .mockResolvedValueOnce({ owner_onboarding_stage: "billing_ready" });
    mocks.ensureOwnerGrowthTrialBillingAccount.mockResolvedValue({});
    mocks.completeUserOwnerOnboarding.mockResolvedValue({ owner_onboarding_stage: "complete" });

    await expect(resumeOwnerOnboardingForUser("user_1")).resolves.toBe("complete");
    expect(mocks.createSiteForUser).toHaveBeenCalledWith("user_1", {
      name: "Acme",
      domain: "https://acme.com"
    });
    expect(mocks.ensureOwnerGrowthTrialBillingAccount).toHaveBeenCalledWith("user_1");
    expect(mocks.completeUserOwnerOnboarding).toHaveBeenCalledWith("user_1");
  });

  it("requires a saved domain before it can create the initial site", async () => {
    mocks.findAuthUserById.mockResolvedValue({
      id: "user_1",
      email: "owner@acme.com",
      owner_onboarding_stage: "account_created",
      owner_onboarding_site_domain: null,
      owner_onboarding_referral_code: null
    });

    await expect(resumeOwnerOnboardingForUser("user_1")).rejects.toThrow("MISSING_DOMAIN");
    expect(mocks.createSiteForUser).not.toHaveBeenCalled();
    expect(mocks.ensureOwnerGrowthTrialBillingAccount).not.toHaveBeenCalled();
  });

  it("keeps the stage retryable when referral attribution fails transiently", async () => {
    mocks.findAuthUserById.mockResolvedValue({
      id: "user_1",
      email: "owner@acme.com",
      owner_onboarding_stage: "billing_ready",
      owner_onboarding_site_domain: "https://acme.com",
      owner_onboarding_referral_code: "AFF-123"
    });
    mocks.listSitesForUser.mockResolvedValueOnce([{ id: "site_1" }]);
    mocks.applyReferralCodeForSignup.mockRejectedValueOnce(new Error("ECONNRESET"));

    await expect(resumeOwnerOnboardingForUser("user_1")).resolves.toBe("billing_ready");
    expect(mocks.createSiteForUser).not.toHaveBeenCalled();
    expect(mocks.completeUserOwnerOnboarding).not.toHaveBeenCalled();
  });

  it("marks setup complete when the stored referral code can no longer be applied", async () => {
    mocks.findAuthUserById.mockResolvedValue({
      id: "user_1",
      email: "owner@acme.com",
      owner_onboarding_stage: "billing_ready",
      owner_onboarding_site_domain: "https://acme.com",
      owner_onboarding_referral_code: "BAD-CODE"
    });
    mocks.listSitesForUser.mockResolvedValueOnce([{ id: "site_1" }]);
    mocks.applyReferralCodeForSignup.mockRejectedValueOnce(new Error("INVALID_REFERRAL_CODE"));
    mocks.completeUserOwnerOnboarding.mockResolvedValue({ owner_onboarding_stage: "complete" });

    await expect(resumeOwnerOnboardingForUser("user_1")).resolves.toBe("complete");
    expect(mocks.completeUserOwnerOnboarding).toHaveBeenCalledWith("user_1");
  });
});
