import { buildReferralSignupUrl } from "@/lib/referral-links";
import { ensureDefaultReferralPrograms } from "@/lib/referrals";

function preferredProgramCode(programs: Awaited<ReturnType<typeof ensureDefaultReferralPrograms>>) {
  return (
    programs.find((program) => program.is_active && program.program_type === "customer")?.code ??
    programs.find((program) => program.is_active)?.code ??
    null
  );
}

function withWidgetAttribution(urlValue: string, siteId: string) {
  const url = new URL(urlValue);
  url.searchParams.set("utm_source", "widget_branding");
  url.searchParams.set("utm_medium", "powered_by");
  url.searchParams.set("utm_campaign", siteId);
  return url.toString();
}

export async function getWidgetBrandingAttributionUrl(userId: string, siteId: string) {
  const programs = await ensureDefaultReferralPrograms(userId);
  return withWidgetAttribution(buildReferralSignupUrl(preferredProgramCode(programs)), siteId);
}
