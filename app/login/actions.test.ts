const authMocks = vi.hoisted(() => ({
  setUserSession: vi.fn(),
  signInUser: vi.fn(),
  signUpUser: vi.fn()
}));

const emailMocks = vi.hoisted(() => ({
  sendAccountWelcomeEmail: vi.fn()
}));

const dataMocks = vi.hoisted(() => ({
  getPostAuthPath: vi.fn()
}));

vi.mock("@/lib/auth", () => authMocks);
vi.mock("@/lib/chatly-transactional-email-senders", () => emailMocks);
vi.mock("@/lib/data", () => dataMocks);

import { loginAction, signupAction, type AuthActionState } from "./actions";

const INITIAL_STATE: AuthActionState = {
  ok: false,
  error: null,
  nextPath: null,
  fields: {
    email: "",
    password: "",
    websiteUrl: "",
    referralCode: ""
  }
};

describe("login actions", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
    authMocks.signInUser.mockReset();
    authMocks.signUpUser.mockReset();
    authMocks.setUserSession.mockReset();
    dataMocks.getPostAuthPath.mockReset();
    emailMocks.sendAccountWelcomeEmail.mockReset();
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("validates login fields before hitting auth", async () => {
    const blankForm = new FormData();
    expect(await loginAction(INITIAL_STATE, blankForm)).toEqual({
      ok: false,
      error: "Work email is required.",
      nextPath: null,
      fields: {
        email: "",
        password: "",
        websiteUrl: "",
        referralCode: ""
      }
    });

    const passwordlessForm = new FormData();
    passwordlessForm.set("email", "hello@chatly.example");
    expect(await loginAction(INITIAL_STATE, passwordlessForm)).toEqual({
      ok: false,
      error: "Password is required.",
      nextPath: null,
      fields: {
        email: "hello@chatly.example",
        password: "",
        websiteUrl: "",
        referralCode: ""
      }
    });
  });

  it("returns an auth mismatch error for unknown users", async () => {
    authMocks.signInUser.mockResolvedValueOnce(null);

    const form = new FormData();
    form.set("email", "hello@chatly.example");
    form.set("password", "password123");

    const result = await loginAction(INITIAL_STATE, form);
    expect(result.error).toBe("That email and password combination didn't match.");
    expect(authMocks.setUserSession).not.toHaveBeenCalled();
  });

  it("creates a session on successful login", async () => {
    authMocks.signInUser.mockResolvedValueOnce({
      id: "user_123",
      email: "hello@chatly.example"
    });
    dataMocks.getPostAuthPath.mockResolvedValueOnce("/dashboard");

    const form = new FormData();
    form.set("email", "hello@chatly.example");
    form.set("password", "password123");

    const result = await loginAction(INITIAL_STATE, form);
    expect(result.ok).toBe(true);
    expect(result.nextPath).toBe("/dashboard");
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_123");
  });

  it("maps setup failures into readable signup errors", async () => {
    authMocks.signUpUser.mockRejectedValueOnce(new Error("EMAIL_TAKEN"));

    const form = new FormData();
    form.set("email", "hello@chatly.example");
    form.set("password", "password123");
    form.set("websiteUrl", "https://chatly.example");

    const result = await signupAction(INITIAL_STATE, form);
    expect(result.error).toBe("That email already has an account.");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("requires a website url for signup", async () => {
    const form = new FormData();
    form.set("email", "hello@chatly.example");
    form.set("password", "password123");

    authMocks.signUpUser.mockRejectedValueOnce(new Error("MISSING_DOMAIN"));

    const result = await signupAction(INITIAL_STATE, form);
    expect(result.error).toBe("Website URL is required.");
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("still logs unexpected signup failures", async () => {
    authMocks.signUpUser.mockRejectedValueOnce(new Error("boom"));

    const form = new FormData();
    form.set("email", "hello@chatly.example");
    form.set("password", "password123");
    form.set("websiteUrl", "https://chatly.example");

    const result = await signupAction(INITIAL_STATE, form);
    expect(result.error).toContain("server setup error");
  });

  it("maps invalid referral codes into a readable signup error", async () => {
    authMocks.signUpUser.mockRejectedValueOnce(new Error("INVALID_REFERRAL_CODE"));

    const form = new FormData();
    form.set("email", "hello@chatly.example");
    form.set("password", "password123");
    form.set("websiteUrl", "https://chatly.example");
    form.set("referralCode", "BAD-CODE");

    const result = await signupAction(INITIAL_STATE, form);
    expect(result.error).toBe("That referral code wasn't recognized.");
  });

  it("creates a session on successful signup", async () => {
    authMocks.signUpUser.mockResolvedValueOnce({
      id: "user_signup",
      email: "new@chatly.example"
    });

    const form = new FormData();
    form.set("email", "new@chatly.example");
    form.set("password", "password123");
    form.set("websiteUrl", "https://chatly.example");
    form.set("referralCode", "AFF-ABC123");

    const result = await signupAction(INITIAL_STATE, form);
    expect(result).toEqual({
      ok: true,
      error: null,
      nextPath: "/onboarding?step=customize",
      fields: {
        email: "new@chatly.example",
        password: "password123",
        websiteUrl: "https://chatly.example",
        referralCode: "AFF-ABC123"
      }
    });
    expect(authMocks.signUpUser).toHaveBeenCalledWith({
      email: "new@chatly.example",
      password: "password123",
      websiteUrl: "https://chatly.example",
      referralCode: "AFF-ABC123"
    });
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_signup");
    expect(emailMocks.sendAccountWelcomeEmail).toHaveBeenCalledWith({
      to: "new@chatly.example",
      firstName: "new",
      dashboardUrl: "https://chatly.example/dashboard"
    });
  });

});
