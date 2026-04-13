import {
  markUserOffline,
  upsertUserPresence
} from "@/lib/repositories/presence-repository";

export async function recordUserPresence(userId: string) {
  await upsertUserPresence(userId);
}

export async function setUserAvailability(
  userId: string,
  availability: "online" | "offline"
) {
  if (availability === "online") {
    await upsertUserPresence(userId);
    return;
  }

  await markUserOffline(userId);
}
