const mocks = vi.hoisted(() => ({
  acceptTeamInvite: vi.fn(),
  cookies: vi.fn(),
  deleteAuthSessionByTokenHash: vi.fn(),
  findAuthUserByEmail: vi.fn(),
  findAuthUserById: vi.fn(),
  findCurrentUserByTokenHash: vi.fn(),
  findExistingUserIdByEmail: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  headers: vi.fn(),
  insertAuthSession: vi.fn(),
  insertAuthUser: vi.fn(),
  redirect: vi.fn(),
  resumeOwnerOnboardingForUser: vi.fn(),
  updateUserOwnerOnboardingIntent: vi.fn(),
  updateAuthUserPassword: vi.fn(),
  validateReferralCodeForSignup: vi.fn(),
  validateTeamInvite: vi.fn()
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies, headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth-owner-onboarding", () => ({ resumeOwnerOnboardingForUser: mocks.resumeOwnerOnboardingForUser }));
vi.mock("@/lib/referrals", () => ({ normalizeReferralCode: (value?: string | null) => value?.trim().toUpperCase() || null, validateReferralCodeForSignup: mocks.validateReferralCodeForSignup }));
vi.mock("@/lib/repositories/auth-owner-onboarding-repository", () => ({ updateUserOwnerOnboardingIntent: mocks.updateUserOwnerOnboardingIntent }));
vi.mock("@/lib/repositories/auth-repository", () => ({ deleteAuthSessionByTokenHash: mocks.deleteAuthSessionByTokenHash, findAuthUserByEmail: mocks.findAuthUserByEmail, findAuthUserById: mocks.findAuthUserById, findCurrentUserByTokenHash: mocks.findCurrentUserByTokenHash, findExistingUserIdByEmail: mocks.findExistingUserIdByEmail, insertAuthSession: mocks.insertAuthSession, insertAuthUser: mocks.insertAuthUser, updateAuthUserPassword: mocks.updateAuthUserPassword }));
vi.mock("@/lib/workspace-access", () => ({ acceptTeamInvite: mocks.acceptTeamInvite, getWorkspaceAccess: mocks.getWorkspaceAccess, validateTeamInvite: mocks.validateTeamInvite }));
vi.mock("@/lib/env.server", () => ({ getAuthSecret: () => "test-auth-secret" }));

import { clearUserSession, getCurrentUser, requireUser, setUserSession, signInUser, signUpInvitedUser, signUpUser } from "@/lib/auth";

describe("auth edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findAuthUserByEmail.mockResolvedValue(null);
    mocks.findExistingUserIdByEmail.mockResolvedValue(null);
    mocks.validateReferralCodeForSignup.mockResolvedValue(undefined);
    mocks.validateTeamInvite.mockResolvedValue(undefined);
    mocks.acceptTeamInvite.mockResolvedValue({ ownerUserId: "owner_123", alreadyAccepted: false });
    mocks.resumeOwnerOnboardingForUser.mockResolvedValue("complete");
    mocks.updateUserOwnerOnboardingIntent.mockResolvedValue(undefined);
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1", role: "admin" });
    mocks.headers.mockResolvedValue(new Headers());
  });

  it("rejects invalid signup inputs for owners and invited teammates", async () => {
    await expect(signUpUser({ email: "", password: "password123", websiteUrl: "https://acme.com" })).rejects.toThrow("MISSING_EMAIL");
    await expect(signUpUser({ email: "owner@acme.com", password: "", websiteUrl: "https://acme.com" })).rejects.toThrow("MISSING_PASSWORD");
    await expect(signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "" })).rejects.toThrow("MISSING_DOMAIN");
    await expect(signUpUser({ email: "owner@acme.com", password: "short", websiteUrl: "https://acme.com" })).rejects.toThrow("WEAK_PASSWORD");
    mocks.findAuthUserByEmail.mockResolvedValueOnce({
      id: "user_1",
      email: "owner@acme.com",
      password_hash: "scrypt:bad:hash",
      owner_onboarding_stage: "complete"
    });
    await expect(signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "https://acme.com" })).rejects.toThrow("EMAIL_TAKEN");

    await expect(signUpInvitedUser({ inviteId: "invite_1", email: "", password: "password123" })).rejects.toThrow("MISSING_EMAIL");
    await expect(signUpInvitedUser({ inviteId: "invite_1", email: "teammate@acme.com", password: "short" })).rejects.toThrow("WEAK_PASSWORD");
  });

  it("returns current users and requires them without redirecting when the session is valid", async () => {
    mocks.cookies.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: "session-token" }), delete: vi.fn() });
    mocks.findCurrentUserByTokenHash.mockResolvedValue({ id: "user_1", email: "owner@acme.com", created_at: "2026-03-29T00:00:00.000Z" });

    await expect(getCurrentUser()).resolves.toEqual(expect.objectContaining({ workspaceOwnerId: "owner_1", workspaceRole: "admin" }));
    await expect(requireUser()).resolves.toEqual(expect.objectContaining({ id: "user_1" }));
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("handles sign-in password mismatches, production cookies, and logout without a token", async () => {
    await signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "https://acme.com" });
    const insertedUser = mocks.insertAuthUser.mock.calls.at(-1)?.[0];
    mocks.findAuthUserByEmail.mockResolvedValueOnce({
      id: insertedUser.userId,
      email: "owner@acme.com",
      created_at: "2026-03-29T00:00:00.000Z",
      password_hash: insertedUser.passwordHash,
      email_verified_at: "2026-03-29T00:00:00.000Z"
    });
    await expect(signInUser("owner@acme.com", "wrong-password")).resolves.toBeNull();

    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const cookieStore = { get: vi.fn().mockReturnValue(undefined), set: vi.fn(), delete: vi.fn() };
    mocks.cookies.mockResolvedValue(cookieStore);
    await setUserSession("user_1");
    expect(cookieStore.set).toHaveBeenCalledWith("chatting_session", expect.any(String), expect.objectContaining({ secure: true }));
    await clearUserSession();
    expect(mocks.deleteAuthSessionByTokenHash).not.toHaveBeenCalled();
    expect(cookieStore.delete).toHaveBeenCalledWith("chatting_session");
    process.env.NODE_ENV = previousEnv;
  });
});
