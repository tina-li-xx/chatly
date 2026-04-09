import { buildActivation, buildHealth } from "@/lib/data/dashboard-growth-activation-health";

describe("dashboard growth activation health edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows rounded countdown copy when more than one hour remains", () => {
    expect(
      buildActivation("2026-03-29T02:30:00.000Z", true, 0, null, new Date("2026-03-29T12:00:00.000Z"))
    ).toMatchObject({
      status: "countdown",
      description: "You still have 15 hours to hit the first-chat activation target."
    });
  });

  it("covers the remaining health score thresholds and labels", () => {
    expect(buildHealth(10, 10, 10, 480, 4, "2026-03-29T11:00:00.000Z")).toMatchObject({
      status: "strong",
      metrics: [
        { detail: "Flat vs last week", tone: "positive" },
        { value: "8m", tone: "positive" },
        { tone: "positive" }
      ]
    });

    expect(buildHealth(10, 8, 10, 1200, 2, "2026-03-20T12:00:00.000Z")).toMatchObject({
      status: "watch",
      metrics: [
        { detail: "-20% vs last week", tone: "neutral" },
        { value: "20m", tone: "neutral" },
        { tone: "neutral" }
      ]
    });

    expect(buildHealth(10, 4, 10, 2500, 0, "2026-03-20T12:00:00.000Z")).toMatchObject({
      status: "at-risk",
      metrics: [
        { detail: "-60% vs last week", tone: "warning" },
        { value: "41m 40s", tone: "warning" },
        { detail: "Last login 9 days ago", tone: "warning" }
      ]
    });

    expect(buildHealth(10, 2, 10, 15000, 0, "2026-03-01T12:00:00.000Z")).toMatchObject({
      metrics: [
        { tone: "warning" },
        { value: "4h 10m", tone: "warning" },
        { detail: "Last login 28 days ago", tone: "warning" }
      ]
    });
  });
});
