import { disableTeamMobileDeviceRow, upsertTeamMobileDeviceRow } from "@/lib/repositories/team-mobile-device-repository";
import { optionalText } from "@/lib/utils";

export async function registerTeamMobileDevice(input: {
  userId: string;
  pushToken: string;
  provider?: "expo" | "apns" | "fcm" | null;
  platform?: string | null;
  appId?: string | null;
  bundleId?: string | null;
  environment?: "sandbox" | "production" | null;
}) {
  const pushToken = optionalText(input.pushToken);
  if (!pushToken) {
    throw new Error("PUSH_TOKEN_REQUIRED");
  }
  const provider =
    input.provider === "apns" ? "apns" : input.provider === "fcm" ? "fcm" : "expo";
  const bundleId = optionalText(input.bundleId);
  const environment = input.environment ?? null;

  if (provider === "apns" && (!bundleId || !environment)) {
    throw new Error("APNS_DEVICE_METADATA_REQUIRED");
  }

  await upsertTeamMobileDeviceRow({
    id: createTeamMobileDeviceId(),
    userId: input.userId,
    provider,
    pushToken,
    platform: optionalText(input.platform),
    appId: optionalText(input.appId),
    bundleId,
    environment
  });
}

export async function unregisterTeamMobileDevice(input: {
  userId: string;
  pushToken: string;
}) {
  const pushToken = optionalText(input.pushToken);
  if (!pushToken) {
    throw new Error("PUSH_TOKEN_REQUIRED");
  }

  await disableTeamMobileDeviceRow({
    userId: input.userId,
    pushToken
  });
}

function createTeamMobileDeviceId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `device_${globalThis.crypto.randomUUID()}`;
  }

  return `device_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
