import { upsertUserPresence } from "@/lib/repositories/presence-repository";

export async function recordUserPresence(userId: string) {
  await upsertUserPresence(userId);
}
