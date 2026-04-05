import { resumeOwnerOnboardingForUser } from "@/lib/auth";
import { getPostAuthPath, onboardingPathForStep } from "@/lib/data";

export async function getOwnerPostAuthPath(userId: string) {
  try {
    await resumeOwnerOnboardingForUser(userId);
    return await getPostAuthPath(userId);
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_DOMAIN") {
      return onboardingPathForStep("customize");
    }

    throw error;
  }
}
