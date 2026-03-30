const mocks = vi.hoisted(() => ({
  applyReferralCodeForSignup: vi.fn(),
  cookies: vi.fn(),
  createBillingAccount: vi.fn(),
  redirect: vi.fn(),
  createSiteForUser: vi.fn(),
  deleteAuthSessionByTokenHash: vi.fn(),
  findAuthUserByEmail: vi.fn(),
  findAuthUserById: vi.fn(),
  findCurrentUserByTokenHash: vi.fn(),
  findExistingUserIdByEmail: vi.fn(),
  insertAuthSession: vi.fn(),
  insertAuthUser: vi.fn(),
  updateAuthUserPassword: vi.fn(),
  validateReferralCodeForSignup: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}));

vi.mock("@/lib/data/sites", () => ({
  createSiteForUser: mocks.createSiteForUser
}));

vi.mock("@/lib/billing-default-account", () => ({
  ensureOwnerGrowthTrialBillingAccount: mocks.createBillingAccount
}));

vi.mock("@/lib/referrals", () => ({
  applyReferralCodeForSignup: mocks.applyReferralCodeForSignup,
  validateReferralCodeForSignup: mocks.validateReferralCodeForSignup
}));

vi.mock("@/lib/repositories/auth-repository", () => ({
  deleteAuthSessionByTokenHash: mocks.deleteAuthSessionByTokenHash,
  findAuthUserByEmail: mocks.findAuthUserByEmail,
  findAuthUserById: mocks.findAuthUserById,
  findCurrentUserByTokenHash: mocks.findCurrentUserByTokenHash,
  findExistingUserIdByEmail: mocks.findExistingUserIdByEmail,
  insertAuthSession: mocks.insertAuthSession,
  insertAuthUser: mocks.insertAuthUser,
  updateAuthUserPassword: mocks.updateAuthUserPassword
}));
import { clearUserSession, getCurrentUser, signUpUser } from "../auth";

describe("auth session helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findExistingUserIdByEmail.mockResolvedValue(null);
    mocks.validateReferralCodeForSignup.mockResolvedValue(undefined);
    mocks.applyReferralCodeForSignup.mockResolvedValue(undefined);
    mocks.createSiteForUser.mockResolvedValue(undefined);
    mocks.createBillingAccount.mockResolvedValue(undefined);
  });

  it("does not try to delete cookies during read-only current user lookups", async () => {
    const deleteCookie = vi.fn();
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "stale-token" }),
      delete: deleteCookie
    });
    mocks.findCurrentUserByTokenHash.mockResolvedValueOnce(null);

    const result = await getCurrentUser();

    expect(result).toBeNull();
    expect(deleteCookie).not.toHaveBeenCalled();
  });

  it("still clears the auth cookie in the explicit logout path", async () => {
    const deleteCookie = vi.fn();
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-token" }),
      delete: deleteCookie
    });

    await clearUserSession();

    expect(mocks.deleteAuthSessionByTokenHash).toHaveBeenCalledTimes(1);
    expect(deleteCookie).toHaveBeenCalledWith("chatly_session");
  });

  it("provisions a growth trial billing account for new workspace owners", async () => {
    await signUpUser({
      email: "owner@acme.com",
      password: "password123",
      websiteUrl: "https://acme.com"
    });

    const insertedUser = mocks.insertAuthUser.mock.calls[0]?.[0];
    expect(insertedUser.userId).toBeTruthy();
    expect(mocks.createSiteForUser).toHaveBeenCalledWith(insertedUser.userId, {
      name: "Acme site",
      domain: "https://acme.com"
    });
    expect(mocks.createBillingAccount).toHaveBeenCalledWith(insertedUser.userId);
  });
});
