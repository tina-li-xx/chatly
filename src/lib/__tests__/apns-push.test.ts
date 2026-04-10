const mocks = vi.hoisted(() => ({
  getApplePushBearerToken: vi.fn(),
  disableMobilePushTokensRow: vi.fn()
}));

vi.mock("@/lib/apns-push-auth", () => ({
  getApplePushBearerToken: mocks.getApplePushBearerToken
}));

vi.mock("@/lib/repositories/mobile-push-repository", () => ({
  disableMobilePushTokensRow: mocks.disableMobilePushTokensRow
}));

import { sendApnsPushNotifications } from "@/lib/apns-push";

describe("apns push delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getApplePushBearerToken.mockReturnValue("apns-token");
  });

  it("sends APNs notifications and disables invalid tokens", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ reason: "Unregistered" }), { status: 410 })
      );

    const result = await sendApnsPushNotifications({
      registrations: [
        {
          pushToken: "token_1",
          bundleId: "com.usechatting.app",
          environment: "production"
        },
        {
          pushToken: "token_2",
          bundleId: "com.usechatting.app",
          environment: "sandbox"
        }
      ],
      conversationId: "conv_1",
      content: "Hello from support",
      attachmentsCount: 0
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.push.apple.com/3/device/token_1",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "apns-topic": "com.usechatting.app" })
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.sandbox.push.apple.com/3/device/token_2",
      expect.any(Object)
    );
    expect(mocks.disableMobilePushTokensRow).toHaveBeenCalledWith(["token_2"]);
    expect(result).toEqual({ sent: 1, disabled: 1 });
    fetchMock.mockRestore();
  });
});
