const mocks = vi.hoisted(() => ({
  countActiveTeamMembershipRows: vi.fn()
}));

vi.mock("@/lib/repositories/workspace-repository", () => ({
  countActiveTeamMembershipRows: mocks.countActiveTeamMembershipRows
}));

import {
  countBillableWorkspaceSeats,
  normalizeBillableSeatCount,
  seatCountFromActiveMemberships
} from "@/lib/billing-seats";

describe("billing seats", () => {
  beforeEach(() => {
    mocks.countActiveTeamMembershipRows.mockReset();
  });

  it("counts the owner plus active memberships", async () => {
    mocks.countActiveTeamMembershipRows.mockResolvedValueOnce(3);

    await expect(countBillableWorkspaceSeats("owner_123")).resolves.toBe(4);
  });

  it("normalizes total seat counts safely", () => {
    expect(normalizeBillableSeatCount(undefined)).toBe(1);
    expect(normalizeBillableSeatCount(-4)).toBe(1);
    expect(normalizeBillableSeatCount(3.8)).toBe(3);
  });

  it("derives billable seats from active memberships only", () => {
    expect(seatCountFromActiveMemberships(0)).toBe(1);
    expect(seatCountFromActiveMemberships(2)).toBe(3);
  });
});
