const authMocks = vi.hoisted(() => ({
  resumeOwnerOnboardingForUser: vi.fn(),
  setUserSession: vi.fn(),
  signInUser: vi.fn(),
  signUpInvitedUser: vi.fn(),
  signUpUser: vi.fn()
}));
const timeZoneMocks = vi.hoisted(() => ({
  persistPreferredTimeZoneForUser: vi.fn()
}));

vi.mock("@/lib/auth", () => authMocks);
vi.mock("@/lib/auth-email-verification", () => ({
  requestEmailVerificationForUserId: vi.fn()
}));
vi.mock("@/lib/auth-password-reset", () => ({
  requestPasswordReset: vi.fn(),
  resetPasswordWithToken: vi.fn()
}));
vi.mock("@/lib/chatting-transactional-email-senders", () => ({
  sendAccountWelcomeEmail: vi.fn()
}));
vi.mock("@/lib/data", () => ({
  getPostAuthPath: vi.fn(),
  onboardingPathForStep: (step: string) => (step === "done" ? "/dashboard" : `/onboarding?step=${step}`)
}));
vi.mock("@/lib/user-timezone-preference", () => timeZoneMocks);
vi.mock("@/lib/workspace-access", () => ({ acceptTeamInvite: vi.fn() }));

import { loginAction, signupAction, type AuthActionState } from "./actions";

const INITIAL_STATE: AuthActionState = {
  ok: false,
  error: null,
  nextPath: null,
  fields: { email: "", password: "", websiteUrl: "", referralCode: "" }
};

function authForm(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("login actions hotspots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  it.each([
    ["EMAIL_TAKEN", "That email already has an account."],
    ["MISSING_EMAIL", "Work email is required."],
    ["MISSING_PASSWORD", "Password is required."],
    ["MISSING_DOMAIN", "Website URL is required."],
    ["INVITE_EXPIRED", "That team invite has expired. Ask the workspace owner to resend it."],
    ["INVITE_OWNER_CONFLICT", "You already own this workspace."]
  ])("maps signup error %s", async (message, expected) => {
    if (String(message).startsWith("INVITE_")) {
      authMocks.signUpInvitedUser.mockRejectedValueOnce(new Error(String(message)));
      await expect(
        signupAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123", inviteId: "invite_1" }))
      ).resolves.toMatchObject({ error: expected });
      return;
    }

    authMocks.signUpUser.mockRejectedValueOnce(new Error(String(message)));
    await expect(
      signupAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123", websiteUrl: "https://example.com" }))
    ).resolves.toMatchObject({ error: expected });
  });

  it("maps the remaining login setup errors and generic fallback", async () => {
    process.env.NODE_ENV = "production";

    authMocks.signInUser.mockRejectedValueOnce(new Error("getaddrinfo ENOTFOUND"));
    await expect(loginAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123" }))).resolves.toMatchObject({
      error: "We couldn't sign you in right now. Please try again in a moment."
    });

    authMocks.signInUser.mockRejectedValueOnce(new Error("boom"));
    await expect(loginAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123" }))).resolves.toMatchObject({
      error: "We couldn't sign you in right now. Please try again in a moment."
    });
  });
});
