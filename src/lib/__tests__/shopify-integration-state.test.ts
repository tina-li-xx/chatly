import { encryptIntegrationCredentials } from "@/lib/integration-credentials";
import {
  buildShopifyIntegrationState,
  readShopifyAccessToken,
  serializeShopifyIntegrationCredentials
} from "@/lib/shopify-integration-state";

describe("shopify integration state", () => {
  it("builds a disconnected default when no row exists", () => {
    expect(buildShopifyIntegrationState(null)).toEqual({
      status: "disconnected",
      domain: "",
      errorMessage: null
    });
  });

  it("reads connected state and encrypted credentials", () => {
    const row = {
      status: "connected",
      external_account_id: "acme-store.myshopify.com",
      settings_json: JSON.stringify({ domain: "acme-store.myshopify.com" }),
      error_message: null,
      credentials_json: serializeShopifyIntegrationCredentials({
        accessToken: "shpat_live"
      })
    };

    expect(buildShopifyIntegrationState(row as never)).toMatchObject({
      status: "connected",
      domain: "acme-store.myshopify.com"
    });
    expect(readShopifyAccessToken(row as never)).toBe("shpat_live");
  });

  it("still reads legacy plaintext credential rows", () => {
    const row = {
      status: "connected",
      external_account_id: "acme-store.myshopify.com",
      settings_json: JSON.stringify({ domain: "acme-store.myshopify.com" }),
      error_message: null,
      credentials_json: JSON.stringify({ accessToken: "shpat_legacy" })
    };

    expect(readShopifyAccessToken(row as never)).toBe("shpat_legacy");
    expect(encryptIntegrationCredentials({ accessToken: "shpat_legacy" })).toMatch(
      /^enc:v1:/
    );
  });
});
