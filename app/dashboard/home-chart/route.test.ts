const mocks = vi.hoisted(() => ({
  getDashboardHomeChartData: vi.fn(),
  jsonOk: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data/dashboard-home", () => ({
  getDashboardHomeChartData: mocks.getDashboardHomeChartData
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonOk: mocks.jsonOk,
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard home-chart route", () => {
  it("returns the auth response when the request is not authorized", async () => {
    const response = Response.json({ ok: false }, { status: 401 });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ response });

    await expect(GET(new Request("http://localhost/dashboard/home-chart"))).resolves.toBe(response);
  });

  it("returns the requested chart range for the current viewer", async () => {
    const response = Response.json({ ok: true, chartPending: false });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ user: { id: "user_1" } });
    mocks.getDashboardHomeChartData.mockResolvedValueOnce({
      chartPending: false,
      chart: { rangeDays: 30, total: 0, totalLabel: "", comparisonLabel: "", changePercent: null, points: [] }
    });
    mocks.jsonOk.mockReturnValueOnce(response);

    await expect(GET(new Request("http://localhost/dashboard/home-chart?range=30"))).resolves.toBe(response);
    expect(mocks.getDashboardHomeChartData).toHaveBeenCalledWith("user_1", 30);
  });

  it("falls back to the default range when the request is invalid", async () => {
    const response = Response.json({ ok: true, chartPending: false });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ user: { id: "user_1" } });
    mocks.getDashboardHomeChartData.mockResolvedValueOnce({
      chartPending: false,
      chart: { rangeDays: 7, total: 0, totalLabel: "", comparisonLabel: "", changePercent: null, points: [] }
    });
    mocks.jsonOk.mockReturnValueOnce(response);

    await GET(new Request("http://localhost/dashboard/home-chart?range=nope"));

    expect(mocks.getDashboardHomeChartData).toHaveBeenCalledWith("user_1", 7);
  });
});
