const mocks = vi.hoisted(() => ({
  listHelpCenterPreviewArticles: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data/help-center", () => ({
  listHelpCenterPreviewArticles: mocks.listHelpCenterPreviewArticles
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("help center preview route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        workspaceRole: "admin"
      }
    });
  });

  it("returns the preview article slice for the current workspace", async () => {
    mocks.listHelpCenterPreviewArticles.mockResolvedValue([
      { id: "article_1", title: "Reset password", slug: "reset-password", body: "Click forgot password", updatedAt: "2026-04-04T10:00:00.000Z" }
    ]);

    const response = await GET();

    expect(await response.json()).toEqual({
      ok: true,
      articles: [
        { id: "article_1", title: "Reset password", slug: "reset-password", body: "Click forgot password", updatedAt: "2026-04-04T10:00:00.000Z" }
      ]
    });
  });

  it("maps preview failures to a stable JSON error", async () => {
    mocks.listHelpCenterPreviewArticles.mockRejectedValueOnce(new Error("boom"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "help-center-preview-failed" });
  });
});
