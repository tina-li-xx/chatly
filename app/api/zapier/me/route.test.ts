const mocks = vi.hoisted(() => ({
  requireZapierApiAuth: vi.fn()
}));

vi.mock("@/lib/zapier-api-auth", () => ({
  requireZapierApiAuth: mocks.requireZapierApiAuth
}));

import { GET } from "./route";

describe("zapier me route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the auth response when authentication fails", async () => {
    const response = Response.json({ ok: false }, { status: 401 });
    mocks.requireZapierApiAuth.mockResolvedValueOnce({ response });

    await expect(GET(new Request("https://chatting.test/api/zapier/me"))).resolves.toBe(
      response
    );
  });

  it("returns the workspace identity for the API key", async () => {
    mocks.requireZapierApiAuth.mockResolvedValueOnce({
      auth: {
        ownerUserId: "owner_1",
        teamName: "Chatting",
        ownerEmail: "owner@chatting.example"
      }
    });

    const response = await GET(new Request("https://chatting.test/api/zapier/me"));

    expect(await response.json()).toEqual({
      ok: true,
      workspace_id: "owner_1",
      team_name: "Chatting",
      owner_email: "owner@chatting.example"
    });
  });
});
