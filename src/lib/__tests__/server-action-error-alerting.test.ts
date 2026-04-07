const mocks = vi.hoisted(() => ({
  notifyServerActionErrorAlert: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("@/lib/error-alerts/reporters", () => ({
  notifyServerActionErrorAlert: mocks.notifyServerActionErrorAlert
}));

import { withServerActionErrorAlerting } from "@/lib/server-action-error-alerting";

describe("server action error alerting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the action result when no error is thrown", async () => {
    const action = withServerActionErrorAlerting(async (value: string) => value.toUpperCase(), {
      actionId: "app/example/actions.ts:saveAction",
      onError: () => "fallback"
    });

    await expect(action("hello")).resolves.toBe("HELLO");
    expect(mocks.notifyServerActionErrorAlert).not.toHaveBeenCalled();
  });

  it("reports unexpected failures and returns the fallback result", async () => {
    const action = withServerActionErrorAlerting(async () => {
      throw new Error("boom");
    }, {
      actionId: "app/example/actions.ts:saveAction",
      onError: () => "fallback"
    });

    await expect(action()).resolves.toBe("fallback");
    await Promise.resolve();

    expect(mocks.notifyServerActionErrorAlert).toHaveBeenCalledWith({
      actionId: "app/example/actions.ts:saveAction",
      error: expect.any(Error)
    });
  });

  it("skips alert delivery when shouldReport returns false", async () => {
    const action = withServerActionErrorAlerting(async () => {
      throw new Error("expected");
    }, {
      actionId: "app/example/actions.ts:saveAction",
      onError: () => "fallback",
      shouldReport: () => false
    });

    await expect(action()).resolves.toBe("fallback");
    expect(mocks.notifyServerActionErrorAlert).not.toHaveBeenCalled();
  });
});
