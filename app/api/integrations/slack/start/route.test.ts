const mocks = vi.hoisted(() => ({
  buildSlackAuthorizeUrl: vi.fn(),
  cookies: vi.fn(),
  getCurrentUser: vi.fn(),
  getSlackOAuthCookieOptions: vi.fn(() => ({ path: "/", httpOnly: true })),
  redirect303: vi.fn()
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/route-helpers", () => ({ redirect303: mocks.redirect303 }));
vi.mock("@/lib/slack-integration", () => ({
  buildSlackAuthorizeUrl: mocks.buildSlackAuthorizeUrl,
  getSlackOAuthCookieOptions: mocks.getSlackOAuthCookieOptions,
  SLACK_OAUTH_STATE_COOKIE: "chatting_slack_oauth_state"
}));

import { GET } from "./route";

describe("slack oauth start route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({ set: vi.fn() });
    mocks.buildSlackAuthorizeUrl.mockReturnValue("https://slack.com/oauth/v2/authorize?client_id=123");
    mocks.redirect303.mockReturnValue(Response.redirect("http://localhost/login", 303));
  });

  it("redirects unauthenticated users to login", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost/api/integrations/slack/start"));

    expect(mocks.redirect303).toHaveBeenCalledWith(
      expect.any(Request),
      "/login"
    );
    expect(response.status).toBe(303);
  });

  it("blocks members from starting workspace slack auth", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce({
      workspaceOwnerId: "owner_1",
      workspaceRole: "member"
    });

    const response = await GET(new Request("http://localhost/api/integrations/slack/start"));

    expect(response.headers.get("content-type")).toContain("text/html");
  });

  it("stores oauth state and redirects to Slack", async () => {
    const cookieStore = { set: vi.fn() };
    mocks.cookies.mockResolvedValueOnce(cookieStore);
    mocks.getCurrentUser.mockResolvedValueOnce({
      workspaceOwnerId: "owner_1",
      workspaceRole: "admin"
    });

    const response = await GET(new Request("http://localhost/api/integrations/slack/start"));

    expect(cookieStore.set).toHaveBeenCalledWith(
      "chatting_slack_oauth_state",
      expect.any(String),
      expect.objectContaining({ path: "/", httpOnly: true })
    );
    expect(mocks.buildSlackAuthorizeUrl).toHaveBeenCalledWith(expect.any(String));
    expect(response.headers.get("location")).toBe(
      "https://slack.com/oauth/v2/authorize?client_id=123"
    );
    expect(response.status).toBe(302);
  });
});
