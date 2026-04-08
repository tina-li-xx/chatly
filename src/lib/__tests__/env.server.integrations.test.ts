import {
  assertIntegrationsEnvConfigured,
  getMissingIntegrationsEnvVars
} from "@/lib/env.server";

describe("env.server integrations validation", () => {
  it("detects missing production integrations env vars", () => {
    expect(
      getMissingIntegrationsEnvVars({
        environment: "production",
        source: {
          NEXT_PUBLIC_ZAPIER_APP_URL: "",
          SHOPIFY_CLIENT_ID: "",
          SHOPIFY_CLIENT_SECRET: "shop-secret",
          SLACK_CLIENT_ID: "",
          SLACK_CLIENT_SECRET: "secret",
          SLACK_SIGNING_SECRET: "",
          INTEGRATIONS_ENCRYPTION_KEY: ""
        }
      })
    ).toEqual([
      "INTEGRATIONS_ENCRYPTION_KEY",
      "NEXT_PUBLIC_ZAPIER_APP_URL",
      "SLACK_CLIENT_ID",
      "SLACK_SIGNING_SECRET",
      "SHOPIFY_CLIENT_ID"
    ]);

    expect(
      getMissingIntegrationsEnvVars({
        environment: "development",
        source: {}
      })
    ).toEqual([]);
  });

  it("fails fast when required production integrations env vars are missing", () => {
    expect(() =>
      assertIntegrationsEnvConfigured({
        environment: "production",
        source: {
          NEXT_PUBLIC_ZAPIER_APP_URL: "",
          SHOPIFY_CLIENT_ID: "shop-client",
          SHOPIFY_CLIENT_SECRET: "",
          SLACK_CLIENT_ID: "client",
          SLACK_CLIENT_SECRET: "",
          SLACK_SIGNING_SECRET: "signing",
          INTEGRATIONS_ENCRYPTION_KEY: "key"
        }
      })
    ).toThrow(
      "[IntegrationsConfig] Missing required integrations env vars: NEXT_PUBLIC_ZAPIER_APP_URL, SLACK_CLIENT_SECRET, SHOPIFY_CLIENT_SECRET"
    );

    expect(() =>
      assertIntegrationsEnvConfigured({
        environment: "production",
        source: {
          NEXT_PUBLIC_ZAPIER_APP_URL: "https://zapier.example/invite/chatting",
          SHOPIFY_CLIENT_ID: "shop-client",
          SHOPIFY_CLIENT_SECRET: "shop-secret",
          SLACK_CLIENT_ID: "client",
          SLACK_CLIENT_SECRET: "secret",
          SLACK_SIGNING_SECRET: "signing",
          INTEGRATIONS_ENCRYPTION_KEY: "key"
        }
      })
    ).not.toThrow();
  });
});
