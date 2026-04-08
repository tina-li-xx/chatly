import { createHash, randomBytes, scrypt as nodeScrypt } from "node:crypto";
import { promisify } from "node:util";
import { sendPasswordResetEmail } from "@/lib/chatting-transactional-email-senders";
import { getPublicAppUrl } from "@/lib/env";
import { getAuthSecret } from "@/lib/env.server";
import {
  findAuthUserByEmail,
  markAuthUserEmailVerified,
  updateAuthUserPassword
} from "@/lib/repositories/auth-repository";
import {
  consumeAuthEmailToken,
  findActiveAuthEmailToken,
  insertAuthEmailToken,
  invalidateAuthEmailTokens
} from "@/lib/repositories/auth-token-repository";

const scrypt = promisify(nodeScrypt);

function hashPasswordResetToken(token: string) {
  return createHash("sha256")
    .update(`${getAuthSecret()}:reset:${token}`)
    .digest("hex");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(`${getAuthSecret()}:${password}`, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

function buildResetUrl(token: string) {
  const url = new URL("/login", getPublicAppUrl());
  url.searchParams.set("mode", "reset");
  url.searchParams.set("token", token);
  return url.toString();
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("MISSING_EMAIL");
  }

  const user = await findAuthUserByEmail(normalizedEmail);
  if (!user) {
    return false;
  }

  const token = randomBytes(32).toString("hex");
  const tokenId = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await invalidateAuthEmailTokens(user.id, "password_reset");
  await insertAuthEmailToken({
    tokenId,
    userId: user.id,
    email: user.email,
    type: "password_reset",
    tokenHash: hashPasswordResetToken(token),
    expiresAt
  });
  await sendPasswordResetEmail({
    to: user.email,
    resetUrl: buildResetUrl(token)
  });

  return true;
}

export async function resetPasswordWithToken(token: string, password: string) {
  const normalizedToken = token.trim();
  const normalizedPassword = password.trim();

  if (!normalizedToken) {
    throw new Error("INVALID_RESET_TOKEN");
  }

  if (!normalizedPassword) {
    throw new Error("MISSING_PASSWORD");
  }

  if (normalizedPassword.length < 8) {
    throw new Error("WEAK_PASSWORD");
  }

  const tokenRow = await findActiveAuthEmailToken("password_reset", hashPasswordResetToken(normalizedToken));
  if (!tokenRow) {
    throw new Error("INVALID_RESET_TOKEN");
  }

  await updateAuthUserPassword(tokenRow.user_id, await hashPassword(normalizedPassword));
  await markAuthUserEmailVerified(tokenRow.user_id);
  await consumeAuthEmailToken(tokenRow.id);
  await invalidateAuthEmailTokens(tokenRow.user_id, "email_verification");

  return {
    userId: tokenRow.user_id
  };
}
