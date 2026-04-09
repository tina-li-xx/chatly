import { buildActivation, buildHealth } from "@/lib/data/dashboard-growth-activation-health";

describe("dashboard growth activation health", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("covers activation states across install, countdown, and first-chat timing", () => {
    expect(
      buildActivation("2026-03-29T00:00:00.000Z", false, 0, null, new Date("2026-03-29T12:00:00.000Z"))
    ).toMatchObject({ status: "needs-install", tone: "warning", action: { href: "/dashboard/widget" } });

    expect(
      buildActivation("2026-03-28T12:15:00.000Z", true, 0, null, new Date("2026-03-29T12:00:00.000Z"))
    ).toMatchObject({
      status: "countdown",
      description: "You still have less than 1 hour to hit the first-chat activation target."
    });

    expect(
      buildActivation("2026-03-28T10:00:00.000Z", true, 0, null, new Date("2026-03-29T12:00:00.000Z"))
    ).toMatchObject({ status: "stalled", badge: "Nudge needed" });

    expect(
      buildActivation(
        "2026-03-28T10:00:00.000Z",
        true,
        1,
        "2026-03-28T18:00:00.000Z",
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toMatchObject({ status: "activated-fast", tone: "positive", helper: "Target met" });

    expect(
      buildActivation(
        "2026-03-28T10:00:00.000Z",
        true,
        1,
        "2026-03-29T12:00:00.000Z",
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toMatchObject({ status: "activated-late", tone: "neutral", action: { href: "/dashboard/widget" } });
  });

  it("builds health cards for zero baseline, volume risk, reply risk, login risk, and strong health", () => {
    const noData = buildHealth(0, 0, 0, null, 0, null);
    expect(noData).toMatchObject({
      status: "at-risk",
      tone: "warning",
      description: "Health will stabilize once you have a few real conversations to benchmark."
    });
    expect(noData.metrics[0]).toMatchObject({ detail: "No conversation baseline yet" });
    expect(noData.metrics[1]).toMatchObject({ value: "No reply data" });
    expect(noData.metrics[2]).toMatchObject({ detail: "No recent login history" });

    const volumeRisk = buildHealth(8, 1, 8, 120, 5, "2026-03-28T12:00:00.000Z");
    expect(volumeRisk).toMatchObject({
      action: { label: "Open analytics", href: "/dashboard/analytics" },
      status: "watch"
    });
    expect(volumeRisk.metrics[0]).toMatchObject({ detail: "-87% vs last week", tone: "warning" });

    const replyRisk = buildHealth(8, 8, 8, 7_200, 5, "2026-03-28T12:00:00.000Z");
    expect(replyRisk).toMatchObject({
      action: { label: "Open inbox", href: "/dashboard/inbox" },
    });
    expect(replyRisk.metrics[1]).toMatchObject({ value: "2h", tone: "warning" });

    const loginRisk = buildHealth(8, 8, 0, 90, 0, "2026-03-28T12:00:00.000Z");
    expect(loginRisk).toMatchObject({
      action: { label: "Review team coverage", href: "/dashboard/team" },
    });
    expect(loginRisk.metrics[0]).toMatchObject({ detail: "First conversation baseline is forming" });
    expect(loginRisk.metrics[2]).toMatchObject({ detail: "Last login yesterday", tone: "warning" });

    expect(buildHealth(12, 12, 12, 240, 6, "2026-03-29T11:00:00.000Z")).toMatchObject({
      status: "strong",
      tone: "positive",
      badge: "Healthy"
    });
  });
});
