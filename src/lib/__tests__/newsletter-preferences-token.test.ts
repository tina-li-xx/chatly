vi.mock("@/lib/env.server", () => ({
  getAuthSecret: () => "test-secret"
}));

import {
  buildNewsletterPreferencesToken,
  parseNewsletterPreferencesToken
} from "@/lib/newsletter-preferences-token";

describe("newsletter preferences token", () => {
  it("builds and parses signed subscriber tokens", () => {
    const token = buildNewsletterPreferencesToken("sub_123");

    expect(parseNewsletterPreferencesToken(token)).toEqual({
      subscriberId: "sub_123"
    });
  });

  it("rejects tampered tokens", () => {
    const token = buildNewsletterPreferencesToken("sub_123");
    const [payload] = token.split(".");

    expect(parseNewsletterPreferencesToken(`${payload}.tampered`)).toBeNull();
  });
});
