const authMocks = vi.hoisted(() => ({
  setUserSession: vi.fn(),
  signInUser: vi.fn(),
  signUpUser: vi.fn()
}));

const emailMocks = vi.hoisted(() => ({ sendAccountWelcomeEmail: vi.fn() }));
const dataMocks = vi.hoisted(() => ({ getPostAuthPath: vi.fn() }));

vi.mock("@/lib/auth", () => authMocks);
vi.mock("@/lib/chatly-transactional-email-senders", () => emailMocks);
vi.mock("@/lib/data", () => dataMocks);

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

describe("login actions edge cases", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("maps the remaining login auth error variants", async () => {
    authMocks.signInUser.mockRejectedValueOnce(new Error("password authentication failed"));
    expect(await loginAction(INITIAL_STATE, authForm({ email: "a@b.com", password: "password123" }))).toMatchObject({
      error: "Database connection failed. Check the Neon DATABASE_URL in your local .env file."
    });
  });

  it("maps production signup setup errors and keeps signup successful when the welcome email fails", async () => {
    process.env.NODE_ENV = "production";

    authMocks.signUpUser.mockRejectedValueOnce(new Error("AUTH_SECRET missing"));
    expect(
      await signupAction(
        INITIAL_STATE,
        authForm({ email: "a@b.com", password: "password123", websiteUrl: "https://example.com" })
      )
    ).toMatchObject({
      error: "AUTH_SECRET is missing in your deployment environment."
    });

    authMocks.signUpUser.mockResolvedValueOnce({ id: "user_1", email: "alex@example.com" });
    emailMocks.sendAccountWelcomeEmail.mockRejectedValueOnce(new Error("smtp down"));

    await expect(
      signupAction(
        INITIAL_STATE,
        authForm({ email: "alex@example.com", password: "password123", websiteUrl: "https://example.com" })
      )
    ).resolves.toMatchObject({
      ok: true,
      nextPath: "/onboarding?step=customize"
    });
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_1");
  });
});
