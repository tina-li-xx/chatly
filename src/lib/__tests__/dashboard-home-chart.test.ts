import {
  buildDashboardHomeChart,
  resolveDashboardHomeRange
} from "@/lib/data/dashboard-home-chart";

describe("dashboard home chart helpers", () => {
  it("defaults invalid range values to 7 days", () => {
    expect(resolveDashboardHomeRange(undefined)).toBe(7);
    expect(resolveDashboardHomeRange("oops")).toBe(7);
    expect(resolveDashboardHomeRange(["90"])).toBe(90);
  });

  it("keeps daily points for 7 days and returns rolling labels", () => {
    const chart = buildDashboardHomeChart(
      [
        { dayKey: "2026-03-26", dayLabel: "Thu", count: "1" },
        { dayKey: "2026-03-27", dayLabel: "Fri", count: "2" },
        { dayKey: "2026-03-28", dayLabel: "Sat", count: "0" },
        { dayKey: "2026-03-29", dayLabel: "Sun", count: "1" },
        { dayKey: "2026-03-30", dayLabel: "Mon", count: "0" },
        { dayKey: "2026-03-31", dayLabel: "Tue", count: "2" },
        { dayKey: "2026-04-01", dayLabel: "Wed", count: "3" }
      ],
      3,
      7
    );

    expect(chart).toMatchObject({
      rangeDays: 7,
      total: 9,
      totalLabel: "Total last 7 days",
      comparisonLabel: "vs previous 7 days",
      changePercent: 200
    });
    expect(chart.points.map((point) => point.label)).toEqual([
      "Thu",
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed"
    ]);
  });

  it("compresses 30-day ranges into five-day buckets", () => {
    const rows = Array.from({ length: 30 }, (_, index) => ({
      dayKey: `2026-03-${String(index + 1).padStart(2, "0")}`,
      dayLabel: "Mon",
      count: "1"
    }));
    const chart = buildDashboardHomeChart(rows, 15, 30);

    expect(chart.total).toBe(30);
    expect(chart.changePercent).toBe(100);
    expect(chart.points).toHaveLength(6);
    expect(chart.points[0]).toMatchObject({ label: "Mar 1", count: 5 });
    expect(chart.points[5]).toMatchObject({ label: "Mar 26", count: 5 });
  });
});
