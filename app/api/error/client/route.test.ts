const mocks = vi.hoisted(() => ({
  notifyClientErrorAlert: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("@/lib/error-alerts/reporters", () => ({
  notifyClientErrorAlert: mocks.notifyClientErrorAlert
}));

import { POST } from "./route";

describe("client error route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts valid client exception payloads", async () => {
    const response = await POST(
      new Request("https://usechatting.com/api/error/client", {
        method: "POST",
        body: JSON.stringify({
          kind: "window.error",
          message: "boom",
          pageUrl: "https://usechatting.com/pricing"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.notifyClientErrorAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "window.error",
        message: "boom"
      })
    );
  });

  it("rejects invalid payloads", async () => {
    const response = await POST(
      new Request("https://usechatting.com/api/error/client", {
        method: "POST",
        body: JSON.stringify({
          kind: "window.error"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.notifyClientErrorAlert).not.toHaveBeenCalled();
  });
});
