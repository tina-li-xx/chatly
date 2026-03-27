import { query } from "@/lib/db";
import type { OnboardingStep } from "@/lib/types";

export type AuthUserRecord = {
  id: string;
  email: string;
  password_hash: string;
  onboarding_step: OnboardingStep;
  onboarding_completed_at: string | null;
  created_at: string;
};

export type AuthSessionUserRecord = {
  id: string;
  email: string;
  onboarding_step: OnboardingStep;
  onboarding_completed_at: string | null;
  created_at: string;
};

export async function findAuthUserById(userId: string) {
  const result = await query<AuthUserRecord>(
    `
      SELECT id, email, password_hash, created_at
      , onboarding_step, onboarding_completed_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function findAuthUserByEmail(email: string) {
  const result = await query<AuthUserRecord>(
    `
      SELECT id, email, password_hash, created_at
      , onboarding_step, onboarding_completed_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findExistingUserIdByEmail(email: string) {
  const result = await query<{ id: string }>(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0]?.id ?? null;
}

export async function insertAuthUser(input: {
  userId: string;
  email: string;
  passwordHash: string;
  onboardingStep?: OnboardingStep;
  onboardingCompletedAt?: string | null;
}) {
  await query(
    `
      INSERT INTO users (id, email, password_hash, onboarding_step, onboarding_completed_at)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      input.userId,
      input.email,
      input.passwordHash,
      input.onboardingStep ?? "done",
      input.onboardingCompletedAt ?? null
    ]
  );
}

export async function updateAuthUserEmail(userId: string, email: string) {
  await query(
    `
      UPDATE users
      SET email = $2
      WHERE id = $1
    `,
    [userId, email]
  );
}

export async function updateAuthUserPassword(userId: string, passwordHash: string) {
  await query(
    `
      UPDATE users
      SET password_hash = $2
      WHERE id = $1
    `,
    [userId, passwordHash]
  );
}

export async function insertAuthSession(input: {
  sessionId: string;
  userId: string;
  tokenHash: string;
}) {
  await query(
    `
      INSERT INTO auth_sessions (id, user_id, token_hash, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')
    `,
    [input.sessionId, input.userId, input.tokenHash]
  );
}

export async function deleteAuthSessionByTokenHash(tokenHash: string) {
  await query(
    `
      DELETE FROM auth_sessions
      WHERE token_hash = $1
    `,
    [tokenHash]
  );
}

export async function findCurrentUserByTokenHash(tokenHash: string) {
  const result = await query<AuthSessionUserRecord>(
    `
      SELECT u.id, u.email, u.created_at
      , u.onboarding_step, u.onboarding_completed_at
      FROM auth_sessions s
      INNER JOIN users u
        ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}
