import { getCurrentAuthSessionTokenHash } from "@/lib/current-auth-session";
import {
  findAuthSessionWorkspaceOwnerByTokenHash,
  updateAuthSessionActiveWorkspaceByTokenHash
} from "@/lib/repositories/auth-repository";

async function getCurrentSessionTokenHash() {
  return getCurrentAuthSessionTokenHash();
}

export async function getCurrentSessionActiveWorkspaceOwnerId() {
  const tokenHash = await getCurrentSessionTokenHash();
  if (!tokenHash) {
    return null;
  }

  return findAuthSessionWorkspaceOwnerByTokenHash(tokenHash);
}

export async function setCurrentSessionActiveWorkspaceOwnerId(ownerUserId: string | null) {
  const tokenHash = await getCurrentSessionTokenHash();
  if (!tokenHash) {
    return;
  }

  await updateAuthSessionActiveWorkspaceByTokenHash(tokenHash, ownerUserId);
}
