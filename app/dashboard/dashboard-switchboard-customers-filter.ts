import type { FounderWorkspace } from "@/lib/data/founder-switchboard";

const DAY_MS = 24 * 60 * 60 * 1000;

export type SwitchboardCustomerFilter = "all" | "active" | "paying" | "trialing" | "verified";

const VALID_CUSTOMER_FILTERS = new Set<SwitchboardCustomerFilter>([
  "all",
  "active",
  "paying",
  "trialing",
  "verified"
]);

function daysUntil(value: string | null) {
  return value ? Math.ceil((new Date(value).getTime() - Date.now()) / DAY_MS) : null;
}

function isOlderThan(value: string | null, days: number) {
  return value ? Date.now() - new Date(value).getTime() > days * DAY_MS : false;
}

export function resolveSwitchboardCustomerFilter(value: string | null | undefined): SwitchboardCustomerFilter {
  const filter = String(value ?? "").trim();
  return VALID_CUSTOMER_FILTERS.has(filter as SwitchboardCustomerFilter)
    ? (filter as SwitchboardCustomerFilter)
    : "all";
}

export function filterSwitchboardWorkspaces(workspaces: FounderWorkspace[], filter: SwitchboardCustomerFilter) {
  switch (filter) {
    case "active":
      return workspaces.filter((workspace) => workspace.conversationsLast7Days > 0 || (workspace.lastLoginAt ? !isOlderThan(workspace.lastLoginAt, 7) : false));
    case "paying":
      return workspaces.filter((workspace) => workspace.planKey === "growth");
    case "trialing":
      return workspaces.filter((workspace) => (daysUntil(workspace.trialEndsAt) ?? -1) >= 0);
    case "verified":
      return workspaces.filter((workspace) => workspace.hasWidgetInstalled);
    case "all":
    default:
      return workspaces;
  }
}

export function switchboardCustomerFilterDescription(filter: SwitchboardCustomerFilter) {
  switch (filter) {
    case "active":
      return "Showing only workspaces with conversation or teammate activity in the last 7 days.";
    case "paying":
      return "Showing only paying workspaces.";
    case "trialing":
      return "Showing only workspaces with a live trial.";
    case "verified":
      return "Showing only workspaces with a verified widget install.";
    case "all":
    default:
      return "Owners, plan state, installs, and recent activity in one table.";
  }
}
