import { query } from "@/lib/db";
import type { OnboardingStep } from "@/lib/types";

export type UserOnboardingStateRow = {
  onboarding_step: OnboardingStep;
  onboarding_completed_at: string | null;
};

export async function findUserOnboardingState(userId: string) {
  const result = await query<UserOnboardingStateRow>(
    `
      SELECT onboarding_step, onboarding_completed_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function updateUserOnboardingStep(userId: string, step: Exclude<OnboardingStep, "signup">) {
  const result = await query<UserOnboardingStateRow>(
    `
      UPDATE users
      SET
        onboarding_step = $2,
        onboarding_completed_at = CASE
          WHEN $2 = 'done' THEN COALESCE(onboarding_completed_at, NOW())
          ELSE NULL
        END
      WHERE id = $1
      RETURNING onboarding_step, onboarding_completed_at
    `,
    [userId, step]
  );

  return result.rows[0] ?? null;
}
