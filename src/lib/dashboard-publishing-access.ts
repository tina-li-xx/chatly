import {
  canAccessFounderSwitchboard,
  FOUNDER_SWITCHBOARD_EMAIL
} from "@/lib/founder-switchboard-access";

export const DASHBOARD_PUBLISHING_VIEWER_EMAIL = FOUNDER_SWITCHBOARD_EMAIL;

export function canAccessDashboardPublishing(userEmail: string) {
  return canAccessFounderSwitchboard(userEmail);
}
