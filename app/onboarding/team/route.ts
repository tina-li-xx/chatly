import { createTeamInvite, listSitesForUser, setUserOnboardingStep, updateSiteOnboardingSetup } from "@/lib/data";
import type { DashboardTeamInvite } from "@/lib/data/settings";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

function normalizeInviteEmails(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => String(entry ?? "").trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 10);
}

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const siteId = String(payload.siteId ?? "").trim();
    const teamName = String(payload.teamName ?? "").trim();
    const domain = String(payload.domain ?? "").trim();
    const inviteEmails = normalizeInviteEmails(payload.inviteEmails);

    const sites = await listSitesForUser(auth.user.id);
    const activeSite = sites.find((site) => site.id === siteId) ?? sites[0];
    if (!activeSite) {
      return jsonError("site-not-found", 404);
    }

    const updatedSite = await updateSiteOnboardingSetup(activeSite.id, auth.user.id, {
      name: teamName,
      domain
    });

    if (!updatedSite) {
      return jsonError("site-not-found", 404);
    }

    let invites: DashboardTeamInvite[] = [];
    for (const email of inviteEmails) {
      invites = await createTeamInvite({
        ownerUserId: auth.user.id,
        email,
        role: "member"
      });
    }

    await setUserOnboardingStep(auth.user.id, "customize");

    return jsonOk({
      site: updatedSite,
      invites,
      step: "customize"
    });
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_SITE_NAME") {
      return jsonError("missing-team-name", 400);
    }

    if (error instanceof Error && error.message === "MISSING_DOMAIN") {
      return jsonError("missing-domain", 400);
    }

    if (error instanceof Error && error.message === "MISSING_EMAIL") {
      return jsonError("missing-email", 400);
    }

    return jsonError("team-setup-failed", 500);
  }
}
