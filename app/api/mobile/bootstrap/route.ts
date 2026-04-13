import { listDashboardTeamMembers } from "@/lib/data/dashboard-team-members";
import {
  getMobileAvailability,
  getMobileNotificationPreferences
} from "@/lib/data/mobile-preferences";
import { getMobileProfile } from "@/lib/data/mobile-profile";
import { listSavedReplies } from "@/lib/data/saved-replies";
import { jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const [profile, teamMembers, savedReplies, availability, notificationPreferences] =
    await Promise.all([
      getMobileProfile(auth.user.id),
      listDashboardTeamMembers(auth.user.id),
      listSavedReplies(auth.user.id, auth.user.workspaceOwnerId),
      getMobileAvailability(auth.user.id),
      getMobileNotificationPreferences(auth.user.id)
    ]);

  return jsonOk({
    profile,
    teamMembers,
    savedReplies,
    availability,
    notificationPreferences
  });
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/mobile/bootstrap/route.ts:GET"
);
