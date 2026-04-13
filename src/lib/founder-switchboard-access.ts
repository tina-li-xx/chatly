export const FOUNDER_SWITCHBOARD_EMAIL = "tina@usechatting.com";
export const FOUNDER_SWITCHBOARD_ROUTE = "/dashboard/switchboard";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function canAccessFounderSwitchboard(userEmail: string) {
  return normalizeEmail(userEmail) === FOUNDER_SWITCHBOARD_EMAIL;
}
