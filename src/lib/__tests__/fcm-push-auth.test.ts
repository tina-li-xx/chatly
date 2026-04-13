const mocks = vi.hoisted(() => ({
  getClient: vi.fn(),
  getFcmPushConfig: vi.fn(),
  getProjectId: vi.fn(),
  googleAuthOptions: [] as unknown[],
  impersonatedGetAccessToken: vi.fn(),
  impersonatedOptions: [] as unknown[]
}));

vi.mock("@/lib/env.server", () => ({
  getFcmPushConfig: mocks.getFcmPushConfig
}));

vi.mock("google-auth-library", () => {
  class MockGoogleAuth {
    constructor(options?: unknown) {
      mocks.googleAuthOptions.push(options ?? null);
    }

    getClient() {
      return mocks.getClient();
    }

    getProjectId() {
      return mocks.getProjectId();
    }
  }

  class MockImpersonated {
    constructor(options: unknown) {
      mocks.impersonatedOptions.push(options);
    }

    getAccessToken() {
      return mocks.impersonatedGetAccessToken();
    }
  }

  return {
    GoogleAuth: MockGoogleAuth,
    Impersonated: MockImpersonated
  };
});

import { getFcmPushBearerToken } from "@/lib/fcm-push-auth";

describe("fcm push auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.googleAuthOptions.length = 0;
    mocks.impersonatedOptions.length = 0;
    mocks.getFcmPushConfig.mockReturnValue({
      projectId: "chatting-prod",
      impersonatedServiceAccount: null
    });
    mocks.getClient.mockResolvedValue({
      getAccessToken: vi.fn().mockResolvedValue("direct-access-token")
    });
    mocks.getProjectId.mockResolvedValue("derived-project");
    mocks.impersonatedGetAccessToken.mockResolvedValue({ token: "impersonated-access-token" });
  });

  it("uses adc directly for firebase messaging when no impersonation target is set", async () => {
    await expect(getFcmPushBearerToken()).resolves.toEqual({
      projectId: "chatting-prod",
      accessToken: "direct-access-token"
    });

    expect(mocks.googleAuthOptions).toEqual([
      { scopes: ["https://www.googleapis.com/auth/firebase.messaging"] }
    ]);
    expect(mocks.impersonatedOptions).toEqual([]);
  });

  it("supports impersonation and derives the project id when needed", async () => {
    const sourceClient = { getAccessToken: vi.fn() };

    mocks.getFcmPushConfig.mockReturnValue({
      projectId: null,
      impersonatedServiceAccount: "fcm-sender@chatting-prod.iam.gserviceaccount.com"
    });
    mocks.getClient.mockResolvedValue(sourceClient);

    await expect(getFcmPushBearerToken()).resolves.toEqual({
      projectId: "derived-project",
      accessToken: "impersonated-access-token"
    });

    expect(mocks.googleAuthOptions).toEqual([
      null,
      { scopes: ["https://www.googleapis.com/auth/cloud-platform"] }
    ]);
    expect(mocks.impersonatedOptions).toEqual([
      {
        sourceClient,
        targetPrincipal: "fcm-sender@chatting-prod.iam.gserviceaccount.com",
        targetScopes: ["https://www.googleapis.com/auth/firebase.messaging"],
        lifetime: 3600
      }
    ]);
  });

  it("throws a clear error when it cannot determine the firebase project id", async () => {
    mocks.getFcmPushConfig.mockReturnValue({
      projectId: null,
      impersonatedServiceAccount: null
    });
    mocks.getProjectId.mockRejectedValue(new Error("missing project"));

    await expect(getFcmPushBearerToken()).rejects.toThrow("FCM_PROJECT_ID_NOT_CONFIGURED");
  });
});
