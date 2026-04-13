import { getFcmPushConfig } from "@/lib/env.server";

describe("env.server fcm config", () => {
  it("allows adc-only fcm auth with no private key env", () => {
    expect(getFcmPushConfig({})).toEqual({
      projectId: null,
      impersonatedServiceAccount: null
    });
  });

  it("reads optional project and impersonation overrides", () => {
    expect(
      getFcmPushConfig({
        FCM_PROJECT_ID: "chatting-prod",
        FCM_IMPERSONATED_SERVICE_ACCOUNT: "fcm-sender@chatting-prod.iam.gserviceaccount.com"
      })
    ).toEqual({
      projectId: "chatting-prod",
      impersonatedServiceAccount: "fcm-sender@chatting-prod.iam.gserviceaccount.com"
    });
  });
});
