const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  exchangeSlackOAuthCode: vi.fn(),
  findWorkspaceIntegrationRow: vi.fn(),
  getCurrentUser: vi.fn(),
  getSlackOAuthCookieOptions: vi.fn(() => ({ path: "/", httpOnly: true })),
  getWorkspaceAccess: vi.fn(),
  integrationPopupErrorResponse: vi.fn((message: string) =>
    new Response(message, { status: 400 })
  ),
  integrationPopupSuccessResponse: vi.fn((detail: Record<string, unknown>) =>
    Response.json(detail)
  ),
  upsertWorkspaceIntegrationRow: vi.fn()
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));
vi.mock("@/lib/integration-popup-response", () => ({
  integrationPopupErrorResponse: mocks.integrationPopupErrorResponse,
  integrationPopupSuccessResponse: mocks.integrationPopupSuccessResponse
}));
vi.mock("@/lib/slack-integration", () => ({
  exchangeSlackOAuthCode: mocks.exchangeSlackOAuthCode,
  getSlackOAuthCookieOptions: mocks.getSlackOAuthCookieOptions,
  SLACK_OAUTH_STATE_COOKIE: "chatting_slack_oauth_state"
}));
vi.mock("@/lib/repositories/integrations-repository", () => ({
  findWorkspaceIntegrationRow: mocks.findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow: mocks.upsertWorkspaceIntegrationRow
}));

import { GET } from "./route";

describe("slack oauth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({
      get: vi.fn(() => ({
        value: JSON.stringify({ state: "state_123", ownerUserId: "owner_1" })
      })),
      set: vi.fn()
    });
  });

  it("rejects invalid oauth state", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/integrations/slack/callback?code=code_123&state=wrong"
      )
    );

    expect(mocks.integrationPopupErrorResponse).toHaveBeenCalledWith(
      "Slack OAuth state verification failed. Please try again."
    );
    expect(response.status).toBe(400);
  });

  it("exchanges the slack code and stores the workspace connection", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce({
      id: "user_1",
      workspaceRole: "admin"
    });
    mocks.getWorkspaceAccess.mockResolvedValueOnce({ ownerUserId: "owner_1" });
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce(null);
    mocks.exchangeSlackOAuthCode.mockResolvedValueOnce({
      accessToken: "xoxb-live",
      tokenType: "bot",
      scopes: ["chat:write"],
      appId: "A123",
      botUserId: "B123",
      teamId: "T123",
      teamName: "Acme Corp",
      refreshToken: null,
      expiresIn: null,
      authedUserId: "U123"
    });

    await GET(
      new Request(
        "http://localhost/api/integrations/slack/callback?code=code_123&state=state_123"
      )
    );

    expect(mocks.exchangeSlackOAuthCode).toHaveBeenCalledWith("code_123");
    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        provider: "slack",
        accountLabel: "Acme Corp",
        externalAccountId: "T123",
        status: "connected"
      })
    );
    expect(mocks.integrationPopupSuccessResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "slack",
        outcome: "success",
        workspaceName: "Acme Corp"
      })
    );
  });
});
