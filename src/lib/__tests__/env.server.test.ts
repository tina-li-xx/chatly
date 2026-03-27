import {
  assertR2EnvConfigured,
  assertStripeBillingEnvConfigured,
  assertStartupProductionCoreEnvConfigured,
  getMissingR2EnvVars,
  getMissingStripeBillingEnvVars,
  getMissingStartupProductionCoreEnvVars,
  getRequiredServerEnv
} from "@/lib/env.server";

describe("env.server", () => {
  it("reads required server env values and throws custom codes when missing", () => {
    expect(getRequiredServerEnv("AUTH_SECRET", { source: { AUTH_SECRET: "secret" } })).toBe("secret");
    expect(() =>
      getRequiredServerEnv("AUTH_SECRET", {
        source: {},
        errorCode: "AUTH_SECRET_MISSING"
      })
    ).toThrow("AUTH_SECRET_MISSING");
  });

  it("detects missing production startup env vars", () => {
    expect(
      getMissingStartupProductionCoreEnvVars({
        environment: "production",
        source: {
          DATABASE_URL: "",
          AUTH_SECRET: "secret",
          NEXT_PUBLIC_APP_URL: ""
        }
      })
    ).toEqual(["DATABASE_URL", "NEXT_PUBLIC_APP_URL"]);

    expect(
      getMissingStartupProductionCoreEnvVars({
        environment: "development",
        source: {}
      })
    ).toEqual([]);
  });

  it("detects missing stripe billing env vars", () => {
    expect(
      getMissingStripeBillingEnvVars({
        source: {
          STRIPE_SECRET_KEY: "sk_test",
          STRIPE_WEBHOOK_SECRET: "",
          STRIPE_PRICE_PRO_MONTHLY: "",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        }
      })
    ).toEqual(["STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_PRO_MONTHLY"]);
  });

  it("detects missing r2 env vars", () => {
    expect(
      getMissingR2EnvVars({
        source: {
          R2_ACCOUNT_ID: "account",
          R2_ACCESS_KEY_ID: "",
          R2_SECRET_ACCESS_KEY: "",
          R2_BUCKET_NAME: "uploads",
          R2_PUBLIC_BASE_URL: ""
        }
      })
    ).toEqual(["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_BASE_URL"]);
  });

  it("asserts production startup env safely", () => {
    expect(() =>
      assertStartupProductionCoreEnvConfigured({
        environment: "production",
        source: {
          DATABASE_URL: "postgres://localhost/chatly",
          AUTH_SECRET: "secret",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        },
        cache: false
      })
    ).not.toThrow();

    expect(() =>
      assertStartupProductionCoreEnvConfigured({
        environment: "production",
        source: {
          DATABASE_URL: "",
          AUTH_SECRET: "",
          NEXT_PUBLIC_APP_URL: ""
        },
        cache: false
      })
    ).toThrow("[StartupEnvConfig]");
  });

  it("asserts stripe and r2 envs in production", () => {
    expect(() =>
      assertStripeBillingEnvConfigured({
        environment: "production",
        source: {
          STRIPE_SECRET_KEY: "sk_test",
          STRIPE_WEBHOOK_SECRET: "whsec_test",
          STRIPE_PRICE_PRO_MONTHLY: "price_123",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        },
        cache: false
      })
    ).not.toThrow();

    expect(() =>
      assertR2EnvConfigured({
        environment: "production",
        source: {
          R2_ACCOUNT_ID: "account",
          R2_ACCESS_KEY_ID: "access",
          R2_SECRET_ACCESS_KEY: "secret",
          R2_BUCKET_NAME: "uploads",
          R2_PUBLIC_BASE_URL: "https://cdn.chatly.example"
        },
        cache: false
      })
    ).not.toThrow();

    expect(() =>
      assertStripeBillingEnvConfigured({
        environment: "production",
        source: {},
        cache: false
      })
    ).toThrow("[StripeBillingConfig]");

    expect(() =>
      assertR2EnvConfigured({
        environment: "production",
        source: {},
        cache: false
      })
    ).toThrow("[R2Config]");
  });
});
