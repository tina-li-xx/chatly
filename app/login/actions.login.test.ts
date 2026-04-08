import {
  authForm,
  authMocks,
  dataMocks,
  INITIAL_STATE,
  loginAction,
  resetActionMocks,
  timeZoneMocks,
  workspaceMocks
} from "./actions.test-helpers";

describe("login actions", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
    resetActionMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("validates login fields before hitting auth", async () => {
    expect(await loginAction(INITIAL_STATE, new FormData())).toEqual({
      ok: false,
      error: "Work email is required.",
      nextPath: null,
      fields: { email: "", password: "", websiteUrl: "", referralCode: "" }
    });

    expect(await loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example" }))).toEqual({
      ok: false,
      error: "Password is required.",
      nextPath: null,
      fields: { email: "hello@chatting.example", password: "", websiteUrl: "", referralCode: "" }
    });
  });

  it("returns an auth mismatch error for unknown users", async () => {
    authMocks.signInUser.mockResolvedValueOnce(null);

    const result = await loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example", password: "password123" }));
    expect(result.error).toBe("That email and password combination didn't match.");
    expect(authMocks.setUserSession).not.toHaveBeenCalled();
  });

  it("blocks unverified users from signing in", async () => {
    authMocks.signInUser.mockRejectedValueOnce(new Error("EMAIL_NOT_VERIFIED"));

    const result = await loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example", password: "password123" }));
    expect(result.error).toBe("Verify your email before signing in. Check your inbox for the verification link.");
    expect(authMocks.setUserSession).not.toHaveBeenCalled();
  });

  it("creates a session on successful login", async () => {
    authMocks.signInUser.mockResolvedValueOnce({ id: "user_123", email: "hello@chatting.example" });
    dataMocks.getPostAuthPath.mockResolvedValueOnce("/dashboard");

    const result = await loginAction(
      INITIAL_STATE,
      authForm({
        email: "hello@chatting.example",
        password: "password123",
        timezone: "Europe/London"
      })
    );
    expect(result.ok).toBe(true);
    expect(result.nextPath).toBe("/dashboard");
    expect(authMocks.resumeOwnerOnboardingForUser).toHaveBeenCalledWith("user_123");
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_123", null);
    expect(timeZoneMocks.persistPreferredTimeZoneForUser).toHaveBeenCalledWith(
      "user_123",
      "Europe/London"
    );
  });

  it("routes incomplete owners without a saved domain back into customize", async () => {
    authMocks.signInUser.mockResolvedValueOnce({ id: "user_123", email: "hello@chatting.example" });
    authMocks.resumeOwnerOnboardingForUser.mockRejectedValueOnce(new Error("MISSING_DOMAIN"));

    const result = await loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example", password: "password123" }));
    expect(result).toMatchObject({ ok: true, nextPath: "/onboarding?step=customize" });
    expect(dataMocks.getPostAuthPath).not.toHaveBeenCalled();
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_123", null);
  });

  it("returns users to safe saved internal urls after successful login", async () => {
    authMocks.signInUser.mockResolvedValue({ id: "user_123", email: "hello@chatting.example" });
    dataMocks.getPostAuthPath.mockResolvedValue("/dashboard");

    await expect(
      loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example", password: "password123", redirectTo: "/dashboard/inbox?id=conv_123" }))
    ).resolves.toMatchObject({ nextPath: "/dashboard/inbox?id=conv_123" });

    await expect(
      loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example", password: "password123", redirectTo: "/feedback?conversationId=conv_123&rating=5" }))
    ).resolves.toMatchObject({ nextPath: "/feedback?conversationId=conv_123&rating=5" });
  });

  it("keeps onboarding redirects ahead of saved urls and rejects unsafe targets", async () => {
    authMocks.signInUser.mockResolvedValue({ id: "user_123", email: "hello@chatting.example" });
    dataMocks.getPostAuthPath
      .mockResolvedValueOnce("/onboarding?step=install")
      .mockResolvedValueOnce("/dashboard");

    await expect(
      loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example", password: "password123", redirectTo: "/dashboard/inbox?id=conv_123" }))
    ).resolves.toMatchObject({ nextPath: "/onboarding?step=install" });

    await expect(
      loginAction(INITIAL_STATE, authForm({ email: "hello@chatting.example", password: "password123", redirectTo: "https://evil.example/phish" }))
    ).resolves.toMatchObject({ nextPath: "/dashboard" });
  });

  it("accepts workspace invites during login", async () => {
    authMocks.signInUser.mockResolvedValueOnce({ id: "user_123", email: "hello@chatting.example" });
    workspaceMocks.acceptTeamInvite.mockResolvedValueOnce({ ownerUserId: "owner_999", alreadyAccepted: false });

    const result = await loginAction(
      INITIAL_STATE,
      authForm({ email: "hello@chatting.example", password: "password123", inviteId: "invite_123" })
    );

    expect(workspaceMocks.acceptTeamInvite).toHaveBeenCalledWith({
      inviteId: "invite_123",
      userId: "user_123",
      email: "hello@chatting.example"
    });
    expect(authMocks.setUserSession).toHaveBeenCalledWith("user_123", "owner_999");
    expect(authMocks.resumeOwnerOnboardingForUser).not.toHaveBeenCalled();
    expect(result.nextPath).toBe("/dashboard");
  });

  it("maps invite-specific login errors cleanly", async () => {
    authMocks.signInUser.mockResolvedValueOnce({ id: "user_123", email: "wrong@chatting.example" });
    workspaceMocks.acceptTeamInvite.mockRejectedValueOnce(new Error("INVITE_EMAIL_MISMATCH"));

    const result = await loginAction(
      INITIAL_STATE,
      authForm({ email: "wrong@chatting.example", password: "password123", inviteId: "invite_123" })
    );

    expect(result.error).toBe("Sign in with the email address that received this invite.");
    expect(authMocks.setUserSession).not.toHaveBeenCalled();
  });
});
