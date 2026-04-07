const mocks = vi.hoisted(() => ({
  sendErrorAlertEmail: vi.fn()
}));

vi.mock("@/lib/error-alerts/delivery", () => ({
  sendErrorAlertEmail: mocks.sendErrorAlertEmail
}));

import {
  notifyClientErrorAlert,
  notifyHttpErrorResponse,
  notifyProcessErrorAlert,
  notifyServerLogAlert
} from "@/lib/error-alerts/reporters";

describe("error alert reporters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends http alerts with request context", async () => {
    await notifyHttpErrorResponse({
      status: 500,
      responseBody: { error: "boom" },
      error: new Error("boom"),
      request: new Request("https://usechatting.com/api/public/messages?site=1", {
        method: "POST",
        headers: {
          "user-agent": "vitest"
        }
      })
    });

    expect(mocks.sendErrorAlertEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "HTTP 500 POST /api/public/messages?site=1"
      })
    );
  });

  it("skips low-signal 404 probes", async () => {
    await notifyHttpErrorResponse({
      status: 404,
      request: new Request("https://usechatting.com/xmlrpc.php", {
        method: "GET"
      })
    });

    expect(mocks.sendErrorAlertEmail).not.toHaveBeenCalled();
  });

  it("sends server, client, and process alerts", async () => {
    await notifyServerLogAlert(["reply post failed", new Error("boom")], "console.error");
    await notifyClientErrorAlert({
      kind: "window.error",
      message: "client boom",
      pageUrl: "https://usechatting.com/pricing"
    });
    await notifyProcessErrorAlert("unhandledRejection", new Error("background boom"));

    expect(mocks.sendErrorAlertEmail).toHaveBeenCalledTimes(3);
  });
});
