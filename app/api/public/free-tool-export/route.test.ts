const mocks = vi.hoisted(() => ({
  requestFreeToolExport: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  requestFreeToolExport: mocks.requestFreeToolExport
}));

import { POST } from "./route";

describe("public free tool export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success for a valid export request", async () => {
    mocks.requestFreeToolExport.mockResolvedValueOnce({ ok: true });

    const response = await POST(
      new Request("http://localhost/api/public/free-tool-export", {
        method: "POST",
        body: JSON.stringify({
          email: "hello@example.com",
          toolSlug: "live-chat-roi-calculator",
          source: "free-tools-live-chat-roi",
          resultPayload: { result: { annualRevenueLift: 51000 } }
        })
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("maps invalid requests to 400 responses", async () => {
    mocks.requestFreeToolExport.mockRejectedValueOnce(new Error("INVALID_EMAIL"));

    const response = await POST(
      new Request("http://localhost/api/public/free-tool-export", {
        method: "POST",
        body: JSON.stringify({ email: "bad-email", toolSlug: "live-chat-roi-calculator" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_email" });
  });

  it("maps unsupported tools to 400 responses", async () => {
    mocks.requestFreeToolExport.mockRejectedValueOnce(new Error("UNSUPPORTED_TOOL_EXPORT"));

    const response = await POST(
      new Request("http://localhost/api/public/free-tool-export", {
        method: "POST",
        body: JSON.stringify({ email: "hello@example.com", toolSlug: "response-template-library" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "unsupported_tool_export" });
  });

  it("maps delivery failures to a stable export error", async () => {
    mocks.requestFreeToolExport.mockRejectedValueOnce(new Error("FREE_TOOL_EXPORT_DELIVERY_FAILED"));

    const response = await POST(
      new Request("http://localhost/api/public/free-tool-export", {
        method: "POST",
        body: JSON.stringify({ email: "hello@example.com", toolSlug: "response-time-calculator", resultPayload: {} })
      })
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "free_tool_export_delivery_failed" });
  });
});
