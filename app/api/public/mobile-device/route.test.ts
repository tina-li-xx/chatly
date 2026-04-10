const mocks = vi.hoisted(() => ({
  getSiteByPublicId: vi.fn(),
  registerPublicMobilePushDevice: vi.fn(),
  unregisterPublicMobilePushDevice: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getSiteByPublicId: mocks.getSiteByPublicId,
  registerPublicMobilePushDevice: mocks.registerPublicMobilePushDevice,
  unregisterPublicMobilePushDevice: mocks.unregisterPublicMobilePushDevice
}));

import { DELETE, OPTIONS, POST } from "./route";

describe("public mobile device route", () => {
  it("returns the preflight response", async () => {
    expect((await OPTIONS()).status).toBe(204);
  });

  it("requires site, session, and push token for registration", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/mobile-device", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId, sessionId, and pushToken are required." });
  });

  it("returns not found when the site does not exist", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/api/public/mobile-device", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", pushToken: "ExponentPushToken[token]" })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Site not found." });
  });

  it("registers a push token when the session is valid", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce({ id: "site_1" });
    mocks.registerPublicMobilePushDevice.mockResolvedValueOnce({ ok: true });

    const response = await POST(
      new Request("http://localhost/api/public/mobile-device", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1",
          pushToken: "ExponentPushToken[token]",
          platform: "ios",
          appId: "my.expo.app"
        })
      })
    );

    expect(mocks.registerPublicMobilePushDevice).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1",
      pushToken: "ExponentPushToken[token]",
      provider: "expo",
      platform: "ios",
      appId: "my.expo.app",
      bundleId: null,
      environment: null
    });
    expect(await response.json()).toEqual({ ok: true });
  });

  it("requires bundle metadata for APNs registrations", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/mobile-device", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          pushToken: "apns-token",
          provider: "apns"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "APNs registrations require bundleId and environment." });
  });

  it("registers APNs tokens with bundle metadata", async () => {
    mocks.getSiteByPublicId.mockResolvedValueOnce({ id: "site_1" });
    mocks.registerPublicMobilePushDevice.mockResolvedValueOnce({ ok: true });

    await POST(
      new Request("http://localhost/api/public/mobile-device", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          pushToken: "apns-token",
          provider: "apns",
          platform: "ios",
          bundleId: "com.usechatting.app",
          environment: "production"
        })
      })
    );

    expect(mocks.registerPublicMobilePushDevice).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: null,
      pushToken: "apns-token",
      provider: "apns",
      platform: "ios",
      appId: null,
      bundleId: "com.usechatting.app",
      environment: "production"
    });
  });

  it("unregisters a push token", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/public/mobile-device", {
        method: "DELETE",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          pushToken: "ExponentPushToken[token]"
        })
      })
    );

    expect(mocks.unregisterPublicMobilePushDevice).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      pushToken: "ExponentPushToken[token]"
    });
    expect(await response.json()).toEqual({ ok: true });
  });
});
