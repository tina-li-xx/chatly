import { renderToStaticMarkup } from "react-dom/server";

type AuthMode = "signin" | "forgot" | "reset" | "success" | "verify";

async function renderAuthForms(
  mode: AuthMode = "signin",
  options?: {
    inviteId?: string;
    inviteEmail?: string;
  }
) {
  vi.resetModules();

  vi.doMock("next/navigation", () => ({
    useRouter: () => ({
      replace: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn()
    })
  }));

  vi.doMock("react-dom", async () => {
    const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
    return {
      ...actual,
      useFormStatus: () => ({ pending: false })
    };
  });

  vi.doMock("./actions", () => ({
    loginAction: vi.fn(),
    signupAction: vi.fn()
  }));
  vi.doMock("./password-actions", () => ({
    forgotPasswordAction: vi.fn(),
    resendVerificationAction: vi.fn(),
    resetPasswordAction: vi.fn()
  }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));

  vi.doMock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    let useStateCalls = 0;

    return {
      ...actual,
      useEffect: vi.fn(),
      useActionState: vi.fn((_: unknown, initialState: unknown) => [initialState, vi.fn()]),
      useState: vi.fn((initialValue: unknown) => {
        useStateCalls += 1;
        if (useStateCalls === 1) {
          return [mode, vi.fn()];
        }

        if (useStateCalls === 3 && mode === "success") {
          return [
            {
              title: "Reset email sent",
              body: "We sent a password reset link to hello@chatting.example."
            },
            vi.fn()
          ];
        }

        return [initialValue, vi.fn()];
      })
    };
  });

  const module = await import("./auth-forms");
  return renderToStaticMarkup(
    <module.AuthForms inviteId={options?.inviteId ?? ""} inviteEmail={options?.inviteEmail ?? ""} />
  );
}

describe("auth forms", () => {
  it("renders the default sign-in state", async () => {
    const html = await renderAuthForms("signin");

    expect(html).toContain("Welcome back to Chatting");
    expect(html).toContain("Sign in");
    expect(html).toContain("Create one");
    expect(html).toContain("Forgot password?");
    expect(html).not.toContain("2,400+");
    expect(html).not.toContain("1.2m");
    expect(html).not.toContain("4.8/5");
  });

  it("renders the forgot-password state", async () => {
    const html = await renderAuthForms("forgot");

    expect(html).toContain("Forgot password");
    expect(html).toContain("Back to sign in");
    expect(html).toContain("Send reset link");
  });

  it("renders the reset-password state", async () => {
    const html = await renderAuthForms("reset");

    expect(html).toContain("Reset password");
    expect(html).toContain("Confirm password");
    expect(html).toContain("Reset password");
  });

  it("renders the resend-verification state", async () => {
    const html = await renderAuthForms("verify");

    expect(html).toContain("Resend verification");
    expect(html).toContain("Back to sign in");
    expect(html).toContain("Send verification link");
  });

  it("renders the success state", async () => {
    const html = await renderAuthForms("success");

    expect(html).toContain("Reset email sent");
    expect(html).toContain("Back to sign in");
    expect(html).not.toContain("Create account");
  });

  it("renders invite-specific sign-in copy", async () => {
    const html = await renderAuthForms("signin", {
      inviteId: "invite_123",
      inviteEmail: "teammate@chatting.example"
    });

    expect(html).toContain("Join your team&#x27;s workspace");
    expect(html).toContain("Sign in to accept your invite");
    expect(html).toContain("Use teammate@chatting.example to join this workspace.");
  });
});
