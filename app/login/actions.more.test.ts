const authMocks = vi.hoisted(() => ({ setUserSession: vi.fn(), resumeOwnerOnboardingForUser: vi.fn() }));
const dataMocks = vi.hoisted(() => ({
  getPostAuthPath: vi.fn(),
  onboardingPathForStep: vi.fn((step: string) => (step === "done" ? "/dashboard" : `/onboarding?step=${step}`))
}));
const passwordResetMocks = vi.hoisted(() => ({ requestPasswordReset: vi.fn(), resetPasswordWithToken: vi.fn() }));

vi.mock("@/lib/auth", () => authMocks);
vi.mock("@/lib/auth-password-reset", () => passwordResetMocks);
vi.mock("@/lib/data", () => dataMocks);

import { forgotPasswordAction, resetPasswordAction } from "./password-actions";

function authForm(fields: Record<string, string>) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  return form;
}

describe("login actions more", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("handles password reset validation and server failures", async () => {
    expect(await forgotPasswordAction(new FormData())).toEqual({
      ok: false,
      error: "Enter your work email to continue.",
      message: null,
      nextPath: null
    });

    passwordResetMocks.requestPasswordReset.mockRejectedValueOnce(new Error("boom"));
    expect(await forgotPasswordAction(authForm({ email: "a@b.com" }))).toEqual({
      ok: false,
      error: "We couldn't send the reset link right now. Please try again in a moment.",
      message: null,
      nextPath: null
    });

    expect(await resetPasswordAction(authForm({ token: "t", password: "short", confirmPassword: "short" }))).toEqual({
      ok: false,
      error: "Use at least 8 characters for the new password.",
      message: null,
      nextPath: null
    });
    expect(await resetPasswordAction(authForm({ token: "t", password: "password123", confirmPassword: "password999" }))).toEqual({
      ok: false,
      error: "Your password confirmation does not match.",
      message: null,
      nextPath: null
    });

    passwordResetMocks.resetPasswordWithToken.mockRejectedValueOnce(new Error("boom"));
    expect(await resetPasswordAction(authForm({ token: "t", password: "password123", confirmPassword: "password123" }))).toEqual({
      ok: false,
      error: "We couldn't reset your password right now. Please try again in a moment.",
      message: null,
      nextPath: null
    });
  });
});
