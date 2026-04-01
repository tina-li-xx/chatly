import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { resumeOwnerOnboardingForUser } from "@/lib/auth-owner-onboarding";
import { getAuthSecret } from "@/lib/env.server";
import { normalizeReferralCode, validateReferralCodeForSignup } from "@/lib/referrals";
import { updateUserOwnerOnboardingIntent } from "@/lib/repositories/auth-owner-onboarding-repository";
import {
  type AuthUserRecord,
  type AuthSessionUserRecord,
  findAuthUserByEmail,
  findAuthUserById,
  findExistingUserIdByEmail,
  insertAuthUser,
  updateAuthUserPassword
} from "@/lib/repositories/auth-repository";
import type { CurrentUser } from "@/lib/types";
import { normalizeSiteDomain } from "@/lib/widget-settings";
import { acceptTeamInvite, validateTeamInvite } from "@/lib/workspace-access";

const scrypt = promisify(nodeScrypt);

type AuthIdentity = Pick<CurrentUser, "id" | "email" | "createdAt">;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validatePassword(password: string) {
  if (!password) throw new Error("MISSING_PASSWORD");
  if (password.length < 8) throw new Error("WEAK_PASSWORD");
}

async function ensureEmailAvailable(email: string) {
  if (await findExistingUserIdByEmail(email)) {
    throw new Error("EMAIL_TAKEN");
  }
}

export function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(`${getAuthSecret()}:${token}`)
    .digest("hex");
}

export function mapUser(row: AuthIdentity | AuthSessionUserRecord | AuthUserRecord): AuthIdentity {
  return {
    id: row.id,
    email: row.email,
    createdAt: "createdAt" in row ? row.createdAt : row.created_at
  };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(`${getAuthSecret()}:${password}`, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function verifyPasswordHash(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derived = (await scrypt(`${getAuthSecret()}:${password}`, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

async function createAuthUser(input: {
  email: string;
  onboardingCompletedAt: string | null;
  onboardingStep: "customize" | "done";
  ownerOnboardingStage?: "account_created" | "complete";
  ownerOnboardingSiteDomain?: string | null;
  ownerOnboardingReferralCode?: string | null;
  password: string;
}) {
  const userId = randomBytes(16).toString("hex");
  await insertAuthUser({
    userId,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    onboardingStep: input.onboardingStep,
    onboardingCompletedAt: input.onboardingCompletedAt,
    ownerOnboardingStage: input.ownerOnboardingStage ?? "complete",
    ownerOnboardingSiteDomain: input.ownerOnboardingSiteDomain ?? null,
    ownerOnboardingReferralCode: input.ownerOnboardingReferralCode ?? null
  });

  return {
    id: userId,
    email: input.email
  };
}

export async function changeUserPassword(userId: string, currentPassword: string, nextPassword: string) {
  const trimmedCurrentPassword = currentPassword.trim();
  const trimmedNextPassword = nextPassword.trim();

  if (!trimmedCurrentPassword) throw new Error("MISSING_CURRENT_PASSWORD");
  validatePassword(trimmedNextPassword);

  const row = await findAuthUserById(userId);
  if (!row) throw new Error("USER_NOT_FOUND");

  const matches = await verifyPasswordHash(trimmedCurrentPassword, row.password_hash);
  if (!matches) throw new Error("INVALID_CURRENT_PASSWORD");

  await updateAuthUserPassword(userId, await hashPassword(trimmedNextPassword));
}

export async function signUpUser(input: {
  email: string;
  password: string;
  websiteUrl?: string;
  referralCode?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const websiteUrl = normalizeSiteDomain(input.websiteUrl);

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }
  if (!websiteUrl) throw new Error("MISSING_DOMAIN");
  validatePassword(password);
  const existingUser = await findAuthUserByEmail(email);
  if (existingUser) {
    const canResume =
      existingUser.owner_onboarding_stage !== "complete" &&
      (await verifyPasswordHash(password, existingUser.password_hash));

    if (!canResume) {
      throw new Error("EMAIL_TAKEN");
    }

    await updateUserOwnerOnboardingIntent({
      userId: existingUser.id,
      siteDomain: websiteUrl,
      referralCode: normalizeReferralCode(input.referralCode)
    });
    await resumeOwnerOnboardingForUser(existingUser.id);
    return mapUser(existingUser);
  }

  await validateReferralCodeForSignup(input.referralCode);

  const user = await createAuthUser({
    email,
    onboardingCompletedAt: null,
    onboardingStep: "customize",
    ownerOnboardingStage: "account_created",
    ownerOnboardingSiteDomain: websiteUrl,
    ownerOnboardingReferralCode: normalizeReferralCode(input.referralCode),
    password
  });
  await resumeOwnerOnboardingForUser(user.id);

  return user;
}

export async function signUpInvitedUser(input: {
  inviteId: string;
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }
  validatePassword(password);

  await validateTeamInvite(input.inviteId, email);
  await ensureEmailAvailable(email);

  const user = await createAuthUser({
    email,
    onboardingCompletedAt: new Date().toISOString(),
    onboardingStep: "done",
    ownerOnboardingStage: "complete",
    password
  });
  await acceptTeamInvite({ inviteId: input.inviteId, userId: user.id, email });

  return user;
}

export async function signInUser(email: string, password: string) {
  const row = await findAuthUserByEmail(normalizeEmail(email));
  if (!row) {
    return null;
  }

  return (await verifyPasswordHash(password.trim(), row.password_hash)) ? mapUser(row) : null;
}
