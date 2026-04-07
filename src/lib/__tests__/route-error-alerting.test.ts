const mocks = vi.hoisted(() => ({
  notifyHttpErrorResponse: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("@/lib/error-alerts/reporters", () => ({
  notifyHttpErrorResponse: mocks.notifyHttpErrorResponse
}));

import {
  isRouteErrorAlertingContextActive,
  withRouteErrorAlerting
} from "@/lib/route-error-alerting";

describe("route error alerting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports error responses returned by handlers", async () => {
    const GET = withRouteErrorAlerting(
      async (request: Request) => Response.json({ error: "boom" }, { status: 500 }),
      "app/api/example/route.ts:GET"
    );

    const response = await GET(new Request("https://usechatting.com/api/example"));

    expect(response.status).toBe(500);
    await vi.waitFor(() => {
      expect(mocks.notifyHttpErrorResponse).toHaveBeenCalledWith({
        status: 500,
        responseBody: { error: "boom" },
        request: expect.any(Request),
        source: "app/api/example/route.ts:GET"
      });
    });
  });

  it("reports thrown route failures and keeps the route context active while running", async () => {
    const GET = withRouteErrorAlerting(async () => {
      expect(isRouteErrorAlertingContextActive()).toBe(true);
      throw new Error("kaboom");
    }, "app/api/example/route.ts:GET");

    await expect(GET()).rejects.toThrow("kaboom");

    await vi.waitFor(() => {
      expect(mocks.notifyHttpErrorResponse).toHaveBeenCalledWith({
        status: 500,
        error: expect.any(Error),
        request: null,
        source: "app/api/example/route.ts:GET"
      });
    });
  });
});
