import {
  getAppDisplayName,
  getAuthSecret,
  getDatabaseConfig,
  getReplyDomain,
  getSesClientConfig,
  getSesInboundTopicArnSet
} from "@/lib/env-server/services";

describe("env-server services edge cases", () => {
  it("prefers explicit auth secrets and derives the development fallback from NODE_ENV", () => {
    expect(getAuthSecret({ source: { AUTH_SECRET: "secret" } })).toBe("secret");
    expect(getAuthSecret({ source: { NODE_ENV: "test" } })).toBe("chatly-dev-secret");
    expect(() => getAuthSecret({ source: { NODE_ENV: "production" } })).toThrow("AUTH_SECRET is not configured.");
  });

  it("returns database config from the centralized database url only", () => {
    expect(getDatabaseConfig({ source: { DATABASE_URL: "postgres://db" } })).toEqual({
      connectionString: "postgres://db"
    });
  });

  it("uses defaults for app naming settings and leaves reply domains optional", () => {
    expect(getAppDisplayName({})).toBe("Chatting");
    expect(getAppDisplayName({ APP_NAME: "Support Hub" })).toBe("Support Hub");
    expect(getReplyDomain({})).toBeNull();
  });

  it("handles SES client configuration with and without credentials", () => {
    expect(getSesClientConfig({ AWS_REGION: "eu-west-1" })).toEqual({
      region: "eu-west-1",
      credentials: undefined
    });
    expect(
      getSesClientConfig({
        AWS_REGION: "eu-west-1",
        AWS_ACCESS_KEY_ID: "key",
        AWS_SECRET_ACCESS_KEY: "secret"
      })
    ).toEqual({
      region: "eu-west-1",
      credentials: {
        accessKeyId: "key",
        secretAccessKey: "secret"
      }
    });
    expect(() => getSesClientConfig({})).toThrow("AWS_REGION is not configured.");
    expect(() => getSesClientConfig({ AWS_REGION: "eu-west-1", AWS_SECRET_ACCESS_KEY: "secret" })).toThrow(
      "AWS SES credentials are incomplete."
    );
  });

  it("reads inbound topic arns from either env key and filters blanks", () => {
    expect(Array.from(getSesInboundTopicArnSet({}))).toEqual([]);
    expect(
      Array.from(
        getSesInboundTopicArnSet({
          AWS_SES_INBOUND_SNS_TOPIC_ARN: " arn:one ,, arn:two "
        })
      )
    ).toEqual(["arn:one", "arn:two"]);
  });
});
