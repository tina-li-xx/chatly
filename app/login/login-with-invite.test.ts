const mocks = vi.hoisted(() => ({
  findExistingUserIdByEmail: vi.fn(),
  markAuthUserEmailVerified: vi.fn(),
  signInUser: vi.fn(),
  validateTeamInvite: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  signInUser: mocks.signInUser
}));

vi.mock("@/lib/repositories/auth-repository", () => ({
  findExistingUserIdByEmail: mocks.findExistingUserIdByEmail,
  markAuthUserEmailVerified: mocks.markAuthUserEmailVerified
}));

vi.mock("@/lib/workspace-access", () => ({
  validateTeamInvite: mocks.validateTeamInvite
}));

import { signInWithInviteAwareVerification } from "./login-with-invite";

describe("invite-aware sign in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-verifies invited existing users after a valid password check", async () => {
    mocks.signInUser
      .mockRejectedValueOnce(new Error("EMAIL_NOT_VERIFIED"))
      .mockResolvedValueOnce({ id: "user_123", email: "apple@usechatting.com" });
    mocks.validateTeamInvite.mockResolvedValueOnce(undefined);
    mocks.findExistingUserIdByEmail.mockResolvedValueOnce("user_123");

    await expect(
      signInWithInviteAwareVerification({
        email: "apple@usechatting.com",
        password: "password123",
        inviteId: "invite_123"
      })
    ).resolves.toEqual({ id: "user_123", email: "apple@usechatting.com" });

    expect(mocks.validateTeamInvite).toHaveBeenCalledWith("invite_123", "apple@usechatting.com");
    expect(mocks.markAuthUserEmailVerified).toHaveBeenCalledWith("user_123");
  });
});
