import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSiteForUser } from "@/lib/data/sites";
import {
  type AuthSessionUserRecord,
  deleteAuthSessionByTokenHash,
  findAuthUserByEmail,
  findAuthUserById,
  findCurrentUserByTokenHash,
  findExistingUserIdByEmail,
  insertAuthSession,
  insertAuthUser,
  updateAuthUserPassword
} from "@/lib/repositories/auth-repository";
import { isProductionRuntime } from "@/lib/env";
import { normalizeSiteDomain } from "@/lib/widget-settings";
import type { CurrentUser } from "@/lib/types";

const AUTH_COOKIE_NAME = "chatly_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const scrypt = promisify(nodeScrypt);

function getAuthSecret() {
  return process.env.AUTH_SECRET?.trim() || (isProductionRuntime() ? "" : "chatly-dev-secret");
}

function requireAuthSecret() {
  const secret = getAuthSecret();

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(`${requireAuthSecret()}:${token}`)
    .digest("hex");
}

function mapUser(
  row: Pick<CurrentUser, "id" | "email" | "createdAt"> | AuthSessionUserRecord
): CurrentUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: "createdAt" in row ? row.createdAt : row.created_at
  };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(`${requireAuthSecret()}:${password}`, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function verifyPasswordHash(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derived = (await scrypt(`${requireAuthSecret()}:${password}`, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

export async function changeUserPassword(userId: string, currentPassword: string, nextPassword: string) {
  const trimmedCurrentPassword = currentPassword.trim();
  const trimmedNextPassword = nextPassword.trim();

  if (!trimmedCurrentPassword) {
    throw new Error("MISSING_CURRENT_PASSWORD");
  }

  if (!trimmedNextPassword) {
    throw new Error("MISSING_PASSWORD");
  }

  if (trimmedNextPassword.length < 8) {
    throw new Error("WEAK_PASSWORD");
  }

  const row = await findAuthUserById(userId);
  if (!row) {
    throw new Error("USER_NOT_FOUND");
  }

  const matches = await verifyPasswordHash(trimmedCurrentPassword, row.password_hash);
  if (!matches) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await hashPassword(trimmedNextPassword);
  await updateAuthUserPassword(userId, passwordHash);
}

function defaultSiteNameForEmail(email: string) {
  const domain = normalizeEmail(email).split("@")[1];
  if (!domain) {
    return "My site";
  }

  const label = domain.split(".")[0];
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} site`;
}

export async function signUpUser(input: {
  email: string;
  password: string;
  websiteUrl?: string;
}) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const siteName = defaultSiteNameForEmail(email);
  const websiteUrl = normalizeSiteDomain(input.websiteUrl);

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }

  if (!password) {
    throw new Error("MISSING_PASSWORD");
  }

  if (!websiteUrl) {
    throw new Error("MISSING_DOMAIN");
  }

  if (password.length < 8) {
    throw new Error("WEAK_PASSWORD");
  }

  const existingUserId = await findExistingUserIdByEmail(email);

  if (existingUserId) {
    throw new Error("EMAIL_TAKEN");
  }

  const userId = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password);

  await insertAuthUser({
    userId,
    email,
    passwordHash,
    onboardingStep: "customize",
    onboardingCompletedAt: null
  });

  await createSiteForUser(userId, {
    name: siteName,
    domain: websiteUrl
  });

  return {
    id: userId,
    email
  };
}

export async function signInUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const row = await findAuthUserByEmail(normalizedEmail);
  if (!row) {
    return null;
  }

  const matches = await verifyPasswordHash(password.trim(), row.password_hash);
  if (!matches) {
    return null;
  }

  return mapUser(row);
}

export async function setUserSession(userId: string) {
  const sessionId = randomBytes(16).toString("hex");
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const cookieStore = await cookies();

  await insertAuthSession({
    sessionId,
    userId,
    tokenHash
  });

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await deleteAuthSessionByTokenHash(hashSessionToken(token));
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const row = await findCurrentUserByTokenHash(hashSessionToken(token));
  if (!row) {
    return null;
  }

  return mapUser(row);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
