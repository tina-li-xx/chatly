const mocks = vi.hoisted(() => ({
  applyReferralCodeForSignup: vi.fn(),
  acceptTeamInvite: vi.fn(),
  cookies: vi.fn(),
  redirect: vi.fn(),
  deleteAuthSessionByTokenHash: vi.fn(),
  findAuthUserByEmail: vi.fn(),
  findAuthUserById: vi.fn(),
  findCurrentUserByTokenHash: vi.fn(),
  findExistingUserIdByEmail: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  headers: vi.fn(),
  insertAuthSession: vi.fn(),
  insertAuthUser: vi.fn(),
  resumeOwnerOnboardingForUser: vi.fn(),
  updateUserOwnerOnboardingIntent: vi.fn(),
  updateAuthUserPassword: vi.fn(),
  validateReferralCodeForSignup: vi.fn(),
  validateTeamInvite: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies,
  headers: mocks.headers
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}));

vi.mock("@/lib/auth-owner-onboarding", () => ({
  resumeOwnerOnboardingForUser: mocks.resumeOwnerOnboardingForUser
}));

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

vi.mock("@/lib/workspace-access", () => ({
  acceptTeamInvite: mocks.acceptTeamInvite,
  getWorkspaceAccess: mocks.getWorkspaceAccess,
  validateTeamInvite: mocks.validateTeamInvite
}));

import {
  clearUserSession,
  getCurrentUser,
  signUpInvitedUser,
  signUpUser
} from "../auth";
import { hashSessionToken } from "../auth-session-token";
describe("auth session helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({
      ownerUserId: "user_123",
      role: "owner",
      ownerEmail: "hello@chatting.example",
      ownerCreatedAt: "2026-03-27T00:00:00.000Z"
    });
    mocks.findAuthUserByEmail.mockResolvedValue(null);
    mocks.findExistingUserIdByEmail.mockResolvedValue(null);
    mocks.validateReferralCodeForSignup.mockResolvedValue(undefined);
    mocks.resumeOwnerOnboardingForUser.mockResolvedValue("complete");
    mocks.updateUserOwnerOnboardingIntent.mockResolvedValue(undefined);
    mocks.validateTeamInvite.mockResolvedValue(undefined);
    mocks.acceptTeamInvite.mockResolvedValue({ ownerUserId: "owner_123", alreadyAccepted: false });
    mocks.headers.mockResolvedValue(new Headers());
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
  it("includes workspace ownership metadata on active sessions", async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "active-token" }),
      delete: vi.fn()
    });
    mocks.findCurrentUserByTokenHash.mockResolvedValueOnce({
      id: "user_123",
      email: "owner@acme.com",
      created_at: "2026-03-29T00:00:00.000Z"
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user_123",
      email: "owner@acme.com",
      createdAt: "2026-03-29T00:00:00.000Z",
      workspaceOwnerId: "user_123",
      workspaceRole: "owner"
    });
  });
  it("prefers bearer auth headers over the cookie session token", async () => {
    mocks.headers.mockResolvedValueOnce(
      new Headers({
        authorization: "Bearer mobile-token"
      })
    );
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "cookie-token" }),
      delete: vi.fn()
    });
    mocks.findCurrentUserByTokenHash.mockResolvedValueOnce({
      id: "user_123",
      email: "owner@acme.com",
      created_at: "2026-03-29T00:00:00.000Z"
    });

    await getCurrentUser();

    expect(mocks.findCurrentUserByTokenHash).toHaveBeenCalledWith(
      hashSessionToken("mobile-token")
    );
  });
  it("still clears the auth cookie in the explicit logout path", async () => {
    const deleteCookie = vi.fn();
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-token" }),
      delete: deleteCookie
    });

    await clearUserSession();

    expect(mocks.deleteAuthSessionByTokenHash).toHaveBeenCalledTimes(1);
    expect(deleteCookie).toHaveBeenCalledWith("chatting_session");
  });
  it("can revoke a bearer-token session without relying on a cookie token", async () => {
    const deleteCookie = vi.fn();
    mocks.headers.mockResolvedValueOnce(
      new Headers({
        authorization: "Bearer mobile-token"
      })
    );
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
      delete: deleteCookie
    });

    await clearUserSession();

    expect(mocks.deleteAuthSessionByTokenHash).toHaveBeenCalledWith(
      hashSessionToken("mobile-token")
    );
    expect(deleteCookie).toHaveBeenCalledWith("chatting_session");
  });
  it("starts resumable onboarding for new workspace owners", async () => {
    await signUpUser({
      email: "owner@acme.com",
      password: "password123",
      websiteUrl: "https://acme.com"
    });

    const insertedUser = mocks.insertAuthUser.mock.calls[0]?.[0];
    expect(insertedUser.userId).toBeTruthy();
    expect(insertedUser.ownerOnboardingStage).toBe("account_created");
    expect(insertedUser.ownerOnboardingSiteDomain).toBe("https://acme.com");
    expect(mocks.resumeOwnerOnboardingForUser).toHaveBeenCalledWith(insertedUser.userId);
  });
  it("skips owner billing setup for invited teammate signups", async () => {
    await signUpInvitedUser({
      inviteId: "invite_123",
      email: "teammate@acme.com",
      password: "password123"
    });

    const insertedUser = mocks.insertAuthUser.mock.calls.at(-1)?.[0];
    expect(mocks.resumeOwnerOnboardingForUser).not.toHaveBeenCalled();
    expect(insertedUser.emailVerifiedAt).toBeTruthy();
    expect(mocks.acceptTeamInvite).toHaveBeenCalledWith({
      inviteId: "invite_123",
      userId: expect.any(String),
      email: "teammate@acme.com"
    });
  });
});
