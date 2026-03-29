import { countActiveTeamMembershipRows } from "@/lib/repositories/workspace-repository";

export function normalizeBillableSeatCount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

export function seatCountFromActiveMemberships(activeMembershipCount: number) {
  if (!Number.isFinite(activeMembershipCount)) {
    return 1;
  }

  return 1 + Math.max(0, Math.floor(activeMembershipCount));
}

export async function countBillableWorkspaceSeats(ownerUserId: string) {
  return seatCountFromActiveMemberships(await countActiveTeamMembershipRows(ownerUserId));
}
