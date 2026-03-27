const mocks = vi.hoisted(() => ({
  removeSiteTeamPhoto: vi.fn(),
  updateSiteTeamPhoto: vi.fn(),
  getTeamPhotoConstraints: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  removeSiteTeamPhoto: mocks.removeSiteTeamPhoto,
  updateSiteTeamPhoto: mocks.updateSiteTeamPhoto
}));

vi.mock("@/lib/r2", () => ({
  getTeamPhotoConstraints: mocks.getTeamPhotoConstraints
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { DELETE, POST } from "./route";

describe("dashboard team-photo route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
    mocks.getTeamPhotoConstraints.mockReturnValue({
      acceptedContentTypes: ["image/png", "image/jpeg"],
      maxBytes: 1024
    });
  });

  it("requires a site id before uploads", async () => {
    const formData = new FormData();
    formData.set("file", new File(["png"], "photo.png", { type: "image/png" }));

    const response = await POST(
      new Request("http://localhost/dashboard/sites/team-photo", {
        method: "POST",
        body: formData
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "site-id-missing" });
  });

  it("rejects invalid image types", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("file", new File(["gif"], "photo.gif", { type: "image/gif" }));

    const response = await POST(
      new Request("http://localhost/dashboard/sites/team-photo", {
        method: "POST",
        body: formData
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid-image-type" });
  });

  it("rejects files that exceed the configured max size", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("file", new File(["x".repeat(2048)], "photo.png", { type: "image/png" }));

    const response = await POST(
      new Request("http://localhost/dashboard/sites/team-photo", {
        method: "POST",
        body: formData
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "image-too-large" });
  });

  it("uploads team photos for valid files", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("file", new File(["png"], "photo.png", { type: "image/png" }));
    mocks.updateSiteTeamPhoto.mockResolvedValueOnce({
      id: "site_1",
      widgetTeamPhotoUrl: "https://cdn.chatly.example/photo.png"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/sites/team-photo", {
        method: "POST",
        body: formData
      })
    );

    expect(mocks.updateSiteTeamPhoto).toHaveBeenCalledWith(
      "site_1",
      "user_123",
      expect.objectContaining({
        fileName: "photo.png",
        contentType: "image/png"
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      site: {
        id: "site_1",
        widgetTeamPhotoUrl: "https://cdn.chatly.example/photo.png"
      }
    });
  });

  it("maps storage configuration failures cleanly", async () => {
    const formData = new FormData();
    formData.set("siteId", "site_1");
    formData.set("file", new File(["png"], "photo.png", { type: "image/png" }));
    mocks.updateSiteTeamPhoto.mockRejectedValueOnce(new Error("R2_NOT_CONFIGURED"));

    const response = await POST(
      new Request("http://localhost/dashboard/sites/team-photo", {
        method: "POST",
        body: formData
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: "storage-not-configured" });
  });

  it("deletes saved team photos", async () => {
    mocks.removeSiteTeamPhoto.mockResolvedValueOnce({
      id: "site_1",
      widgetTeamPhotoUrl: null
    });

    const response = await DELETE(
      new Request("http://localhost/dashboard/sites/team-photo", {
        method: "DELETE",
        body: JSON.stringify({ siteId: "site_1" })
      })
    );

    expect(mocks.removeSiteTeamPhoto).toHaveBeenCalledWith("site_1", "user_123");
    expect(await response.json()).toEqual({
      ok: true,
      site: {
        id: "site_1",
        widgetTeamPhotoUrl: null
      }
    });
  });
});
