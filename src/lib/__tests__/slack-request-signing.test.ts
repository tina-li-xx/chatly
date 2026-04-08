const mocks = vi.hoisted(() => ({
  getRequiredServerEnv: vi.fn()
}));

vi.mock("@/lib/env.server", () => ({
  getRequiredServerEnv: mocks.getRequiredServerEnv
}));

import { createHmac } from "node:crypto";
import { verifySlackRequestSignature } from "@/lib/slack-request-signing";

function signedHeaders(body: string, timestamp = "1712487600") {
  const signature = `v0=${createHmac("sha256", "signing-secret")
    .update(`v0:${timestamp}:${body}`)
    .digest("hex")}`;

  return new Headers({
    "x-slack-request-timestamp": timestamp,
    "x-slack-signature": signature
  });
}

describe("slack request signing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRequiredServerEnv.mockReturnValue("signing-secret");
  });

  it("accepts valid signatures", () => {
    const body = JSON.stringify({ type: "url_verification", challenge: "abc" });
    expect(
      verifySlackRequestSignature(
        signedHeaders(body),
        body,
        Number("1712487600") * 1000
      )
    ).toEqual({ ok: true });
  });

  it("rejects stale or invalid signatures", () => {
    const body = JSON.stringify({ ok: true });

    expect(
      verifySlackRequestSignature(new Headers(), body)
    ).toEqual({ ok: false, error: "missing-slack-signature", status: 401 });

    expect(
      verifySlackRequestSignature(
        signedHeaders(body, "1712487000"),
        body,
        Number("1712487600") * 1000
      )
    ).toEqual({ ok: false, error: "stale-slack-request", status: 401 });

    expect(
      verifySlackRequestSignature(
        new Headers({
          "x-slack-request-timestamp": "1712487600",
          "x-slack-signature": "v0=bad"
        }),
        body,
        Number("1712487600") * 1000
      )
    ).toEqual({ ok: false, error: "invalid-slack-signature", status: 401 });
  });
});
