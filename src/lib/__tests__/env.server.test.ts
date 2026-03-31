import {
  assertR2EnvConfigured,
  assertStripeBillingEnvConfigured,
  assertStartupProductionCoreEnvConfigured,
  buildStripeEnvSource,
  getAuthSecret,
  getOptionalStripeServerEnv,
  getRequiredStripeServerEnv,
  getDatabaseConfig,
  getMissingStripeCheckoutEnvVars,
  getMissingR2EnvVars,
  getMissingStripeBillingEnvVars,
  getMissingStartupProductionCoreEnvVars,
  getRequiredServerEnv,
  getReplyDomain,
  isStripeBillingReady,
  isStripeConfigured,
  getSesClientConfig,
  getSesInboundTopicArnSet
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

  it("centralizes auth, database, ses, and reply env access", () => {
    expect(getAuthSecret({ environment: "development", source: {} })).toBe("chatly-dev-secret");
    expect(() => getAuthSecret({ environment: "production", source: {} })).toThrow(
      "AUTH_SECRET is not configured."
    );

    expect(
      getDatabaseConfig({
        source: {
          DATABASE_URL: "postgres://localhost/chatly"
        }
      })
    ).toEqual({
      connectionString: "postgres://localhost/chatly"
    });

    expect(
      getSesClientConfig({
        AWS_REGION: "eu-north-1",
        AWS_ACCESS_KEY_ID: "key",
        AWS_SECRET_ACCESS_KEY: "secret"
      })
    ).toEqual({
      region: "eu-north-1",
      credentials: {
        accessKeyId: "key",
        secretAccessKey: "secret"
      }
    });

    expect(() =>
      getSesClientConfig({
        AWS_REGION: "eu-north-1",
        AWS_ACCESS_KEY_ID: "key"
      })
    ).toThrow("AWS SES credentials are incomplete.");

    expect(
      Array.from(
        getSesInboundTopicArnSet({
          SES_INBOUND_SNS_TOPIC_ARN: "arn:one, arn:two"
        })
      )
    ).toEqual(["arn:one", "arn:two"]);
    expect(getReplyDomain({ REPLY_DOMAIN: "reply.chatly.example" })).toBe("reply.chatly.example");
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
          STRIPE_PRICE_GROWTH_MONTHLY: "",
          STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_annual",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        }
      })
    ).toEqual(["STRIPE_PRICE_GROWTH_MONTHLY", "STRIPE_WEBHOOK_SECRET"]);

    expect(
      getMissingStripeCheckoutEnvVars({
        source: {
          STRIPE_SECRET_KEY: "sk_test",
          STRIPE_WEBHOOK_SECRET: "",
          STRIPE_PRICE_GROWTH_MONTHLY: "",
          STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_annual",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        }
      })
    ).toEqual(["STRIPE_PRICE_GROWTH_MONTHLY"]);

    expect(
      isStripeConfigured({
        STRIPE_SECRET_KEY: "sk_test",
        STRIPE_PRICE_GROWTH_MONTHLY: "price_growth_monthly",
        STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_annual",
        NEXT_PUBLIC_APP_URL: "https://chatly.example"
      })
    ).toBe(true);

    expect(
      isStripeBillingReady({
        STRIPE_SECRET_KEY: "sk_test",
        STRIPE_PRICE_GROWTH_MONTHLY: "price_growth_monthly",
        STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_annual",
        NEXT_PUBLIC_APP_URL: "https://chatly.example"
      })
    ).toBe(false);
  });

  it("prefers STRIPE_DEV_* values outside production", () => {
    expect(
      getRequiredStripeServerEnv("STRIPE_SECRET_KEY", {
        environment: "development",
        source: {
          STRIPE_DEV_SECRET_KEY: "sk_dev",
          STRIPE_SECRET_KEY: ""
        }
      })
    ).toBe("sk_dev");

    expect(
      getRequiredStripeServerEnv("STRIPE_PRICE_GROWTH_MONTHLY", {
        environment: "development",
        source: {
          STRIPE_DEV_PRICE_GROWTH_MONTHLY: "price_dev_monthly",
          STRIPE_PRICE_GROWTH_MONTHLY: "price_live_monthly"
        }
      })
    ).toBe("price_dev_monthly");

    expect(
      getOptionalStripeServerEnv("STRIPE_WEBHOOK_SECRET", {
        environment: "development",
        source: {
          STRIPE_DEV_WEBHOOK_SECRET: "whsec_dev"
        }
      })
    ).toBe("whsec_dev");

    expect(
      isStripeConfigured(
        {
          STRIPE_DEV_SECRET_KEY: "sk_dev",
          STRIPE_DEV_PRICE_GROWTH_MONTHLY: "price_dev_monthly",
          STRIPE_DEV_PRICE_GROWTH_ANNUAL: "price_dev_annual",
          STRIPE_PRICE_GROWTH_MONTHLY: "price_growth_monthly",
          STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_annual",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        },
        "development"
      )
    ).toBe(true);

    expect(
      isStripeBillingReady(
        {
          STRIPE_DEV_SECRET_KEY: "sk_dev",
          STRIPE_DEV_WEBHOOK_SECRET: "whsec_dev",
          STRIPE_DEV_PRICE_GROWTH_MONTHLY: "price_dev_monthly",
          STRIPE_DEV_PRICE_GROWTH_ANNUAL: "price_dev_annual",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        },
        "development"
      )
    ).toBe(true);

    expect(
      getRequiredStripeServerEnv("STRIPE_SECRET_KEY", {
        environment: "production",
        source: {
          STRIPE_DEV_SECRET_KEY: "sk_dev",
          STRIPE_SECRET_KEY: "sk_live"
        }
      })
    ).toBe("sk_live");

    expect(
      buildStripeEnvSource(
        {
          STRIPE_DEV_SECRET_KEY: "sk_dev",
          STRIPE_DEV_WEBHOOK_SECRET: "whsec_dev",
          STRIPE_DEV_PRICE_GROWTH_MONTHLY: "price_dev_monthly",
          STRIPE_DEV_PRICE_GROWTH_ANNUAL: "price_dev_annual",
          STRIPE_SECRET_KEY: "sk_live",
          STRIPE_WEBHOOK_SECRET: "whsec_live",
          STRIPE_PRICE_GROWTH_MONTHLY: "price_live_monthly",
          STRIPE_PRICE_GROWTH_ANNUAL: "price_live_annual"
        },
        "development"
      )
    ).toMatchObject({
      STRIPE_SECRET_KEY: "sk_dev",
      STRIPE_WEBHOOK_SECRET: "whsec_dev",
      STRIPE_PRICE_GROWTH_MONTHLY: "price_dev_monthly",
      STRIPE_PRICE_GROWTH_ANNUAL: "price_dev_annual"
    });
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
    ).toEqual(["R2_ACCESS_KEY_ID", "R2_PUBLIC_BASE_URL", "R2_SECRET_ACCESS_KEY"]);
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

  it("asserts stripe envs in every environment and r2 envs in production", () => {
    expect(() =>
      assertStripeBillingEnvConfigured({
        environment: "development",
        source: {
          STRIPE_SECRET_KEY: "sk_test",
          STRIPE_WEBHOOK_SECRET: "whsec_test",
          STRIPE_PRICE_GROWTH_MONTHLY: "price_growth_monthly",
          STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_annual",
          NEXT_PUBLIC_APP_URL: "https://chatly.example"
        },
        cache: false
      })
    ).not.toThrow();

    expect(() =>
      assertStripeBillingEnvConfigured({
        environment: "production",
        source: {
          STRIPE_SECRET_KEY: "sk_test",
          STRIPE_WEBHOOK_SECRET: "whsec_test",
          STRIPE_PRICE_GROWTH_MONTHLY: "price_growth_monthly",
          STRIPE_PRICE_GROWTH_ANNUAL: "price_growth_annual",
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
        environment: "development",
        source: {},
        cache: false
      })
    ).toThrow("[StripeBillingConfig]");

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
