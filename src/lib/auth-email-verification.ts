import { createHash, randomBytes } from "node:crypto";
import { sendEmailVerificationEmail } from "@/lib/chatting-transactional-email-senders";
import { getPublicAppUrl } from "@/lib/env";
import { getAuthSecret } from "@/lib/env.server";
import {
  findAuthUserByEmail,
  findAuthUserById,
  markAuthUserEmailVerified
} from "@/lib/repositories/auth-repository";
import {
  consumeAuthEmailToken,
  findActiveAuthEmailToken,
  insertAuthEmailToken,
  invalidateAuthEmailTokens
} from "@/lib/repositories/auth-token-repository";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

function hashEmailVerificationToken(token: string) {
  return createHash("sha256")
    .update(`${getAuthSecret()}:verify:${token}`)
    .digest("hex");
}

function buildVerifyUrl(token: string) {
  const url = new URL("/verify", getPublicAppUrl());
  url.searchParams.set("token", token);
  return url.toString();
}

async function issueEmailVerificationForUser(user: {
  id: string;
  email: string;
  email_verified_at: string | null;
}) {
  if (user.email_verified_at) {
    return false;
  }

  const token = randomBytes(32).toString("hex");
  const tokenId = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS).toISOString();

  await invalidateAuthEmailTokens(user.id, "email_verification");
  await insertAuthEmailToken({
    tokenId,
    userId: user.id,
    email: user.email,
    type: "email_verification",
    tokenHash: hashEmailVerificationToken(token),
    expiresAt
  });
  await sendEmailVerificationEmail({
    to: user.email,
    verifyUrl: buildVerifyUrl(token)
  });

  return true;
}

export async function requestEmailVerification(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("MISSING_EMAIL");
  }

  const user = await findAuthUserByEmail(normalizedEmail);
  if (!user) {
    return false;
  }

  return issueEmailVerificationForUser(user);
}

export async function requestEmailVerificationForUserId(userId: string) {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error("MISSING_USER");
  }

  const user = await findAuthUserById(normalizedUserId);
  if (!user) {
    return false;
  }

  return issueEmailVerificationForUser(user);
}

export async function verifyEmailWithToken(token: string) {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error("INVALID_VERIFICATION_TOKEN");
  }

  const tokenRow = await findActiveAuthEmailToken(
    "email_verification",
    hashEmailVerificationToken(normalizedToken)
  );
  if (!tokenRow) {
    throw new Error("INVALID_VERIFICATION_TOKEN");
  }

  await markAuthUserEmailVerified(tokenRow.user_id);
  await consumeAuthEmailToken(tokenRow.id);
  await invalidateAuthEmailTokens(tokenRow.user_id, "email_verification");
}
