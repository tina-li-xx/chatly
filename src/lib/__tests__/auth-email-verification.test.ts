const mocks = vi.hoisted(() => ({
  consumeAuthEmailToken: vi.fn(),
  findActiveAuthEmailToken: vi.fn(),
  findAuthUserByEmail: vi.fn(),
  findAuthUserById: vi.fn(),
  insertAuthEmailToken: vi.fn(),
  invalidateAuthEmailTokens: vi.fn(),
  markAuthUserEmailVerified: vi.fn(),
  sendEmailVerificationEmail: vi.fn()
}));

vi.mock("@/lib/chatting-transactional-email-senders", () => ({
  sendEmailVerificationEmail: mocks.sendEmailVerificationEmail
}));
vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://chatting.example"
}));
vi.mock("@/lib/env.server", () => ({
  getAuthSecret: () => "test-auth-secret"
}));
vi.mock("@/lib/repositories/auth-repository", () => ({
  findAuthUserByEmail: mocks.findAuthUserByEmail,
  findAuthUserById: mocks.findAuthUserById,
  markAuthUserEmailVerified: mocks.markAuthUserEmailVerified
}));
vi.mock("@/lib/repositories/auth-token-repository", () => ({
  consumeAuthEmailToken: mocks.consumeAuthEmailToken,
  findActiveAuthEmailToken: mocks.findActiveAuthEmailToken,
  insertAuthEmailToken: mocks.insertAuthEmailToken,
  invalidateAuthEmailTokens: mocks.invalidateAuthEmailTokens
}));

import {
  requestEmailVerification,
  requestEmailVerificationForUserId,
  verifyEmailWithToken
} from "@/lib/auth-email-verification";

describe("auth email verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("issues verification tokens for unverified users", async () => {
    mocks.findAuthUserById.mockResolvedValueOnce({
      id: "user_123",
      email: "hello@chatting.example",
      email_verified_at: null
    });

    await expect(requestEmailVerificationForUserId("user_123")).resolves.toBe(true);

    expect(mocks.invalidateAuthEmailTokens).toHaveBeenCalledWith("user_123", "email_verification");
    expect(mocks.insertAuthEmailToken).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user_123",
      email: "hello@chatting.example",
      type: "email_verification",
      expiresAt: "2026-04-02T12:00:00.000Z"
    }));
    expect(mocks.sendEmailVerificationEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: "hello@chatting.example",
      verifyUrl: expect.stringContaining("https://chatting.example/verify?token=")
    }));
  });

  it("skips resend delivery for missing or already verified accounts", async () => {
    mocks.findAuthUserByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "user_verified",
      email: "verified@chatting.example",
      email_verified_at: "2026-03-31T10:00:00.000Z"
    });

    await expect(requestEmailVerification("missing@chatting.example")).resolves.toBe(false);
    await expect(requestEmailVerification("verified@chatting.example")).resolves.toBe(false);

    expect(mocks.sendEmailVerificationEmail).not.toHaveBeenCalled();
    expect(mocks.insertAuthEmailToken).not.toHaveBeenCalled();
  });

  it("verifies valid tokens and rejects invalid ones", async () => {
    mocks.findActiveAuthEmailToken.mockResolvedValueOnce({
      id: "token_123",
      user_id: "user_123",
      email: "hello@chatting.example",
      type: "email_verification",
      token_hash: "hash",
      expires_at: "2026-04-02T12:00:00.000Z",
      consumed_at: null
    }).mockResolvedValueOnce(null);

    await expect(verifyEmailWithToken("valid-token")).resolves.toBeUndefined();
    expect(mocks.markAuthUserEmailVerified).toHaveBeenCalledWith("user_123");
    expect(mocks.consumeAuthEmailToken).toHaveBeenCalledWith("token_123");
    expect(mocks.invalidateAuthEmailTokens).toHaveBeenCalledWith("user_123", "email_verification");

    await expect(verifyEmailWithToken("expired-token")).rejects.toThrow("INVALID_VERIFICATION_TOKEN");
  });
});
