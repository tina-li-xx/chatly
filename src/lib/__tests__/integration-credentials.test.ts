import {
  encryptIntegrationCredentials,
  isEncryptedIntegrationCredentials,
  parseIntegrationCredentials
} from "@/lib/integration-credentials";

describe("integration credentials", () => {
  it("encrypts and decrypts provider credentials", () => {
    const encrypted = encryptIntegrationCredentials({
      accessToken: "xoxb-live",
      teamId: "T123"
    });

    expect(isEncryptedIntegrationCredentials(encrypted)).toBe(true);
    expect(
      parseIntegrationCredentials<{
        accessToken: string;
        teamId: string;
      }>(encrypted)
    ).toEqual({
      accessToken: "xoxb-live",
      teamId: "T123"
    });
  });

  it("still parses legacy plaintext json rows", () => {
    expect(
      parseIntegrationCredentials<{ accessToken: string }>(
        JSON.stringify({ accessToken: "xoxb-legacy" })
      )
    ).toEqual({
      accessToken: "xoxb-legacy"
    });
  });
});
