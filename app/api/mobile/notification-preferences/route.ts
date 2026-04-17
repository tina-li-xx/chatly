import {
  getMobileNotificationPreferences,
  type MobileNotificationSound,
  updateMobileNotificationPreferences
} from "@/lib/services/mobile";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";

const SOUND_OPTIONS = new Set<MobileNotificationSound>([
  "none",
  "chime",
  "ding",
  "pop",
  "swoosh",
  "default"
]);

async function handleGET() {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  return jsonOk({
    notificationPreferences: await getMobileNotificationPreferences(auth.user.id)
  });
}

async function handlePOST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  if (
    typeof body?.allMessagesEnabled !== "boolean" ||
    typeof body?.assignedEnabled !== "boolean" ||
    typeof body?.newConversationEnabled !== "boolean" ||
    typeof body?.pushEnabled !== "boolean" ||
    !SOUND_OPTIONS.has(body?.soundName as MobileNotificationSound) ||
    typeof body?.vibrationEnabled !== "boolean"
  ) {
    return jsonError("missing-fields", 400);
  }

    return jsonOk({
      notificationPreferences: await updateMobileNotificationPreferences(auth.user.id, {
        allMessagesEnabled: body.allMessagesEnabled,
        assignedEnabled: body.assignedEnabled,
        newConversationEnabled: body.newConversationEnabled,
        pushEnabled: body.pushEnabled,
        soundName: body.soundName,
        vibrationEnabled: body.vibrationEnabled
      })
    });
}

export const GET = withRouteErrorAlerting(
  handleGET,
  "app/api/mobile/notification-preferences/route.ts:GET"
);
export const POST = withRouteErrorAlerting(
  handlePOST,
  "app/api/mobile/notification-preferences/route.ts:POST"
);
