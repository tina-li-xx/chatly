import { getNextDashboardPublishingDate } from "@/lib/dashboard-publishing-cadence";

describe("dashboard publishing cadence", () => {
  it("uses the next free daily slot after scheduled posts already in the queue", () => {
    const nextDate = getNextDashboardPublishingDate(
      [
        { publicationStatus: "scheduled", publishedAt: "2026-04-13T09:00:00.000Z" },
        { publicationStatus: "scheduled", publishedAt: "2026-04-14T09:00:00.000Z" },
        { publicationStatus: "scheduled", publishedAt: "2026-04-15T09:00:00.000Z" },
        { publicationStatus: "draft", publishedAt: "2026-04-14T09:00:00.000Z" }
      ],
      new Date("2026-04-13T02:30:00.000Z")
    );

    expect(nextDate).toBe("2026-04-16T09:00:00.000Z");
  });

  it("uses today's slot when it is still ahead and no scheduled post has claimed it", () => {
    const nextDate = getNextDashboardPublishingDate(
      [{ publicationStatus: "draft", publishedAt: "2026-04-13T09:00:00.000Z" }],
      new Date("2026-04-13T02:30:00.000Z")
    );

    expect(nextDate).toBe("2026-04-13T09:00:00.000Z");
  });
});
