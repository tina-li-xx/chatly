import {
  buildZapierApiKeyPrefix,
  generateZapierApiKey,
  hashZapierApiKey,
  verifyZapierApiKey
} from "@/lib/zapier-integration";

describe("zapier integration helpers", () => {
  it("generates a live API key and prefix", () => {
    const apiKey = generateZapierApiKey();

    expect(apiKey).toMatch(/^ck_live_[a-f0-9]{32}$/);
    expect(buildZapierApiKeyPrefix(apiKey)).toBe(apiKey.slice(0, 20));
  });

  it("hashes and verifies API keys", () => {
    const apiKey = "ck_live_1234567890abcdef1234567890abcdef";
    const hashed = hashZapierApiKey(apiKey);

    expect(
      verifyZapierApiKey({
        apiKey,
        keyHash: hashed.keyHash,
        keySalt: hashed.keySalt
      })
    ).toBe(true);
    expect(
      verifyZapierApiKey({
        apiKey: "ck_live_other",
        keyHash: hashed.keyHash,
        keySalt: hashed.keySalt
      })
    ).toBe(false);
  });
});
