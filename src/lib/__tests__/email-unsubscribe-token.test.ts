vi.mock("@/lib/env.server", () => ({
  getAuthSecret: () => "test-secret"
}));

import {
  buildEmailUnsubscribeToken,
  parseEmailUnsubscribeToken
} from "@/lib/email-unsubscribe-token";

describe("email unsubscribe token", () => {
  it("builds and parses signed email tokens", () => {
    const token = buildEmailUnsubscribeToken("Hello@Example.com");

    expect(parseEmailUnsubscribeToken(token)).toEqual({
      email: "hello@example.com"
    });
  });

  it("rejects tampered tokens", () => {
    const token = buildEmailUnsubscribeToken("hello@example.com");
    const [payload] = token.split(".");

    expect(parseEmailUnsubscribeToken(`${payload}.tampered`)).toBeNull();
  });
});
