const mocks = vi.hoisted(() => ({
  jsonError: vi.fn((error: string, status: number) => Response.json({ ok: false, error }, { status })),
  jsonOk: vi.fn((body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status })),
  registerTeamMobileDevice: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  unregisterTeamMobileDevice: vi.fn()
}));

vi.mock("@/lib/data/team-mobile-devices", () => ({
  registerTeamMobileDevice: mocks.registerTeamMobileDevice,
  unregisterTeamMobileDevice: mocks.unregisterTeamMobileDevice
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: mocks.jsonError,
  jsonOk: mocks.jsonOk,
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { DELETE, POST } from "./route";

describe("mobile device route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication for device registration", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });

    const response = await POST(
      new Request("http://localhost/api/mobile/device", {
        method: "POST",
        body: JSON.stringify({ pushToken: "ExponentPushToken[token]" })
      })
    );

    expect(response.status).toBe(401);
  });

  it("registers the current user's push token", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_1"
      }
    });

    const response = await POST(
      new Request("http://localhost/api/mobile/device", {
        method: "POST",
        body: JSON.stringify({
          pushToken: "native-ios-token",
          provider: "apns",
          platform: "ios",
          appId: "com.usechatting.app",
          bundleId: "com.usechatting.app",
          environment: "production"
        })
      })
    );

    expect(mocks.registerTeamMobileDevice).toHaveBeenCalledWith({
      userId: "user_1",
      pushToken: "native-ios-token",
      provider: "apns",
      platform: "ios",
      appId: "com.usechatting.app",
      bundleId: "com.usechatting.app",
      environment: "production"
    });
    expect(await response.json()).toEqual({ ok: true, registered: true });
  });

  it("unregisters the current user's push token", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: {
        id: "user_1"
      }
    });

    const response = await DELETE(
      new Request("http://localhost/api/mobile/device", {
        method: "DELETE",
        body: JSON.stringify({
          pushToken: "ExponentPushToken[token]"
        })
      })
    );

    expect(mocks.unregisterTeamMobileDevice).toHaveBeenCalledWith({
      userId: "user_1",
      pushToken: "ExponentPushToken[token]"
    });
    expect(await response.json()).toEqual({ ok: true, revoked: true });
  });
});
