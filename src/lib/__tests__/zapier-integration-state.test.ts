import {
  buildZapierIntegrationState,
  serializeZapierIntegrationCredentials
} from "@/lib/zapier-integration-state";

describe("zapier integration state", () => {
  it("builds a disconnected default when no row exists", () => {
    expect(buildZapierIntegrationState(null)).toEqual({
      connected: false,
      apiKeyReady: false,
      apiKey: "",
      activeZapCount: null
    });
  });

  it("reads connected state and encrypted credentials", () => {
    const row = {
      status: "connected",
      settings_json: JSON.stringify({ activeZapCount: 3 }),
      credentials_json: serializeZapierIntegrationCredentials({
        apiKey: "ck_live_saved"
      })
    };

    expect(buildZapierIntegrationState(row as never)).toMatchObject({
      connected: true,
      apiKeyReady: true,
      apiKey: "ck_live_saved",
      activeZapCount: 3
    });
  });

  it("treats provisioned API keys without active zaps as ready, not connected", () => {
    const row = {
      status: "connected",
      settings_json: JSON.stringify({ activeZapCount: null }),
      credentials_json: JSON.stringify({ apiKey: "ck_live_legacy" })
    };

    expect(buildZapierIntegrationState(row as never)).toMatchObject({
      connected: false,
      apiKeyReady: true,
      apiKey: "ck_live_legacy"
    });
  });
});
