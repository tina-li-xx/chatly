const mocks = vi.hoisted(() => ({
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
  validateReferralCodeForSignup: vi.fn()
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies, headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth-owner-onboarding", () => ({ resumeOwnerOnboardingForUser: mocks.resumeOwnerOnboardingForUser }));
vi.mock("@/lib/referrals", () => ({
  normalizeReferralCode: (value?: string | null) => value?.trim().toUpperCase() || null,
  validateReferralCodeForSignup: mocks.validateReferralCodeForSignup
}));
vi.mock("@/lib/repositories/auth-owner-onboarding-repository", () => ({
  updateUserOwnerOnboardingIntent: mocks.updateUserOwnerOnboardingIntent
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
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/env.server", () => ({ getAuthSecret: () => "test-auth-secret" }));

import {
  changeUserPassword,
  requireUser,
  setUserSession,
  signInUser,
  signUpUser
} from "../auth";

describe("auth more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findAuthUserByEmail.mockResolvedValue(null);
    mocks.findExistingUserIdByEmail.mockResolvedValue(null);
    mocks.validateReferralCodeForSignup.mockResolvedValue(undefined);
    mocks.resumeOwnerOnboardingForUser.mockResolvedValue("complete");
    mocks.updateUserOwnerOnboardingIntent.mockResolvedValue(undefined);
    mocks.headers.mockResolvedValue(new Headers());
  });

  it("signs users in with a stored password hash and writes session cookies", async () => {
    await signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "https://acme.com" });
    const insertedUser = mocks.insertAuthUser.mock.calls[0]?.[0];
    const cookieStore = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
    mocks.findAuthUserByEmail.mockResolvedValueOnce({
      id: insertedUser.userId,
      email: "owner@acme.com",
      created_at: "2026-03-29T00:00:00.000Z",
      password_hash: insertedUser.passwordHash,
      email_verified_at: "2026-03-29T00:00:00.000Z"
    });
    mocks.cookies.mockResolvedValue(cookieStore);

    await expect(signInUser("OWNER@ACME.COM", "password123")).resolves.toEqual({
      id: insertedUser.userId,
      email: "owner@acme.com",
      createdAt: "2026-03-29T00:00:00.000Z"
    });
    await setUserSession(insertedUser.userId, "owner_1");

    expect(mocks.insertAuthSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: insertedUser.userId, activeWorkspaceOwnerId: "owner_1" })
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "chatting_session",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", secure: false, path: "/" })
    );
  });

  it("rejects invalid sign-in and password-change paths before updating the password", async () => {
    await expect(signInUser("missing@acme.com", "password123")).resolves.toBeNull();
    await signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "https://acme.com" });
    const insertedUser = mocks.insertAuthUser.mock.calls.at(-1)?.[0];
    mocks.findAuthUserByEmail.mockResolvedValueOnce({
      id: insertedUser.userId,
      email: "owner@acme.com",
      created_at: "2026-03-29T00:00:00.000Z",
      password_hash: insertedUser.passwordHash,
      email_verified_at: null
    });
    await expect(signInUser("owner@acme.com", "password123")).rejects.toThrow("EMAIL_NOT_VERIFIED");
    await expect(changeUserPassword("user_1", "", "password123")).rejects.toThrow("MISSING_CURRENT_PASSWORD");
    await expect(changeUserPassword("user_1", "password123", "short")).rejects.toThrow("WEAK_PASSWORD");
    mocks.findAuthUserById.mockResolvedValueOnce(null);
    await expect(changeUserPassword("user_1", "password123", "betterpassword")).rejects.toThrow("USER_NOT_FOUND");

    mocks.findAuthUserById.mockResolvedValueOnce({ password_hash: insertedUser.passwordHash });
    await expect(changeUserPassword("user_1", "wrong-password", "betterpassword")).rejects.toThrow("INVALID_CURRENT_PASSWORD");
  });

  it("updates passwords with a valid current secret and redirects when requireUser has no session", async () => {
    await signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "https://acme.com" });
    const insertedUser = mocks.insertAuthUser.mock.calls.at(-1)?.[0];
    mocks.findAuthUserById.mockResolvedValueOnce({ password_hash: insertedUser.passwordHash });
    await changeUserPassword("user_1", "password123", "betterpassword");
    expect(mocks.updateAuthUserPassword).toHaveBeenCalledWith("user_1", expect.any(String));

    mocks.cookies.mockResolvedValueOnce({ get: vi.fn().mockReturnValue(undefined), delete: vi.fn() });
    mocks.headers.mockResolvedValueOnce(
      new Headers({ "x-chatting-request-path": "/dashboard/inbox?id=conversation_1" })
    );
    await requireUser();
    expect(mocks.redirect).toHaveBeenCalledWith("/login?redirectTo=%2Fdashboard%2Finbox%3Fid%3Dconversation_1");
  });

  it("resumes existing incomplete owner accounts when the password matches", async () => {
    await signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "https://acme.com" });
    const insertedUser = mocks.insertAuthUser.mock.calls.at(-1)?.[0];
    mocks.findAuthUserByEmail.mockResolvedValueOnce({
      id: insertedUser.userId,
      email: "owner@acme.com",
      created_at: "2026-03-29T00:00:00.000Z",
      password_hash: insertedUser.passwordHash,
      owner_onboarding_stage: "account_created"
    });

    await expect(
      signUpUser({ email: "owner@acme.com", password: "password123", websiteUrl: "https://updated.acme.com" })
    ).resolves.toEqual({
      id: insertedUser.userId,
      email: "owner@acme.com",
      createdAt: "2026-03-29T00:00:00.000Z"
    });
    expect(mocks.updateUserOwnerOnboardingIntent).toHaveBeenCalledWith({
      userId: insertedUser.userId,
      siteDomain: "https://updated.acme.com",
      referralCode: null
    });
    expect(mocks.resumeOwnerOnboardingForUser).toHaveBeenCalledWith(insertedUser.userId);
  });
});
