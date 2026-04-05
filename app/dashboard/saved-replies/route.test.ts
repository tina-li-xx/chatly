const mocks = vi.hoisted(() => ({
  createSavedReply: vi.fn(),
  deleteSavedReply: vi.fn(),
  listSavedReplies: vi.fn(),
  updateSavedReply: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createSavedReply: mocks.createSavedReply,
  deleteSavedReply: mocks.deleteSavedReply,
  listSavedReplies: mocks.listSavedReplies,
  updateSavedReply: mocks.updateSavedReply
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET, POST } from "./route";

describe("dashboard saved replies route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatly.example",
        workspaceRole: "admin",
        workspaceOwnerId: "owner_123"
      }
    });
  });

  it("lists saved replies for the current workspace", async () => {
    mocks.listSavedReplies.mockResolvedValueOnce([
      { id: "reply_1", title: "Pricing", body: "Hello", tags: ["pricing"], updatedAt: "2026-04-02T12:00:00.000Z" }
    ]);

    const response = await GET();

    expect(mocks.listSavedReplies).toHaveBeenCalledWith("user_123", "owner_123");
    expect(await response.json()).toEqual({
      ok: true,
      savedReplies: [{ id: "reply_1", title: "Pricing", body: "Hello", tags: ["pricing"], updatedAt: "2026-04-02T12:00:00.000Z" }]
    });
  });

  it("creates, updates, and deletes replies for non-member users", async () => {
    mocks.createSavedReply.mockResolvedValueOnce({
      id: "reply_1",
      title: "Pricing",
      body: "Hello",
      tags: ["pricing", "sales"],
      updatedAt: "2026-04-02T12:00:00.000Z"
    });
    mocks.updateSavedReply.mockResolvedValueOnce({
      id: "reply_1",
      title: "Pricing",
      body: "Updated",
      tags: ["pricing"],
      updatedAt: "2026-04-02T12:05:00.000Z"
    });

    const createResponse = await POST(
      new Request("http://localhost/dashboard/saved-replies", {
        method: "POST",
        body: JSON.stringify({ action: "create", title: "Pricing", body: "Hello", tags: ["pricing", "sales"] })
      })
    );
    const updateResponse = await POST(
      new Request("http://localhost/dashboard/saved-replies", {
        method: "POST",
        body: JSON.stringify({ action: "update", id: "reply_1", title: "Pricing", body: "Updated", tags: ["pricing"] })
      })
    );
    const deleteResponse = await POST(
      new Request("http://localhost/dashboard/saved-replies", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: "reply_1" })
      })
    );

    expect(await createResponse.json()).toEqual({
      ok: true,
      savedReply: {
        id: "reply_1",
        title: "Pricing",
        body: "Hello",
        tags: ["pricing", "sales"],
        updatedAt: "2026-04-02T12:00:00.000Z"
      }
    });
    expect(await updateResponse.json()).toEqual({
      ok: true,
      savedReply: {
        id: "reply_1",
        title: "Pricing",
        body: "Updated",
        tags: ["pricing"],
        updatedAt: "2026-04-02T12:05:00.000Z"
      }
    });
    expect(await deleteResponse.json()).toEqual({ ok: true, id: "reply_1" });
    expect(mocks.createSavedReply).toHaveBeenCalledWith(
      "user_123",
      {
        title: "Pricing",
        body: "Hello",
        tags: ["pricing", "sales"]
      },
      "owner_123"
    );
    expect(mocks.updateSavedReply).toHaveBeenCalledWith(
      "user_123",
      {
        id: "reply_1",
        title: "Pricing",
        body: "Updated",
        tags: ["pricing"]
      },
      "owner_123"
    );
  });

  it("forbids members and maps validation errors", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: { id: "user_456", email: "member@chatly.example", workspaceRole: "member" }
    });
    const forbidden = await POST(
      new Request("http://localhost/dashboard/saved-replies", {
        method: "POST",
        body: JSON.stringify({ action: "create", title: "Pricing", body: "Hello" })
      })
    );

    mocks.createSavedReply.mockRejectedValueOnce(new Error("MISSING_FIELDS"));
    const validation = await POST(
      new Request("http://localhost/dashboard/saved-replies", {
        method: "POST",
        body: JSON.stringify({ action: "create", title: "", body: "" })
      })
    );

    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toEqual({ ok: false, error: "forbidden" });
    expect(validation.status).toBe(400);
    expect(await validation.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("rejects unknown actions and not-found deletes", async () => {
    mocks.deleteSavedReply.mockRejectedValueOnce(new Error("NOT_FOUND"));

    const unknown = await POST(
      new Request("http://localhost/dashboard/saved-replies", {
        method: "POST",
        body: JSON.stringify({ action: "archive" })
      })
    );
    const missing = await POST(
      new Request("http://localhost/dashboard/saved-replies", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: "reply_missing" })
      })
    );

    expect(unknown.status).toBe(400);
    expect(await unknown.json()).toEqual({ ok: false, error: "unknown-action" });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ ok: false, error: "not-found" });
  });
});
