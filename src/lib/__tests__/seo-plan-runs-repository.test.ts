const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  findSeoPlanRunRow,
  insertSeoPlanRunRow,
  listSeoPlanRunRows,
  updateSeoPlanRunStatus
} from "@/lib/repositories/seo-plan-runs-repository";

describe("seo plan runs repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists and finds plan runs by owner scope", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "run_1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "run_2" }] });

    await expect(listSeoPlanRunRows("owner_1", 5)).resolves.toEqual([{ id: "run_1" }]);
    await expect(findSeoPlanRunRow("owner_1", "run_2")).resolves.toEqual({ id: "run_2" });

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("FROM seo_plan_runs");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["owner_1", 5]);
    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["owner_1", "run_2"]);
  });

  it("inserts and updates plan runs with json payloads", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "run_1", status: "draft" }] })
      .mockResolvedValueOnce({ rows: [{ id: "run_1", status: "ready" }] });

    await expect(
      insertSeoPlanRunRow({
        id: "run_1",
        ownerUserId: "owner_1",
        actorUserId: "user_1",
        strategySnapshotJson: { profile: "chatting" },
        summaryJson: { itemCount: 30 }
      })
    ).resolves.toMatchObject({ id: "run_1" });

    await expect(
      updateSeoPlanRunStatus({
        id: "run_1",
        ownerUserId: "owner_1",
        status: "ready",
        summaryJson: { itemCount: 30 }
      })
    ).resolves.toMatchObject({ status: "ready" });

    expect(String(mocks.query.mock.calls[0]?.[0] ?? "")).toContain("INSERT INTO seo_plan_runs");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual([
      "run_1",
      "owner_1",
      "user_1",
      "chatting-default",
      "draft",
      "{\"profile\":\"chatting\"}",
      "{\"itemCount\":30}",
      null
    ]);
    expect(String(mocks.query.mock.calls[1]?.[0] ?? "")).toContain("UPDATE seo_plan_runs");
  });
});
