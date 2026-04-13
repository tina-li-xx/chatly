const mocks = vi.hoisted(() => ({
  disableTeamMobilePushTokens: vi.fn(),
  getFcmPushBearerToken: vi.fn()
}));

vi.mock("@/lib/fcm-push-auth", () => ({
  getFcmPushBearerToken: mocks.getFcmPushBearerToken
}));

vi.mock("@/lib/repositories/team-mobile-device-repository", () => ({
  disableTeamMobilePushTokens: mocks.disableTeamMobilePushTokens
}));

import { sendTeamFcmPushNotifications } from "@/lib/team-mobile-fcm-push";

describe("team mobile fcm push", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFcmPushBearerToken.mockResolvedValue({
      projectId: "chatting-prod",
      accessToken: "fcm-access-token"
    });
  });

  it("disables unregistered fcm tokens", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              status: "NOT_FOUND",
              details: [{ errorCode: "UNREGISTERED" }]
            }
          }),
          { status: 404 }
        )
      );

    await expect(
      sendTeamFcmPushNotifications({
        pushTokens: ["token-1", "token-2"],
        conversationId: "conv_1",
        title: "Alex",
        body: "Need help"
      })
    ).resolves.toEqual({ sent: 1, disabled: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://fcm.googleapis.com/v1/projects/chatting-prod/messages:send",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer fcm-access-token"
        })
      })
    );
    expect(mocks.disableTeamMobilePushTokens).toHaveBeenCalledWith(["token-2"]);
    fetchMock.mockRestore();
  });
});
