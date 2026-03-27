import { setUserOnboardingStep } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";
import type { OnboardingStep } from "@/lib/types";

function nextAllowedStep(value: unknown): Exclude<OnboardingStep, "signup"> | null {
  if (value === "customize" || value === "install" || value === "done") {
    return value;
  }

  return null;
}

export async function POST(request: Request) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const step = nextAllowedStep(payload.step);
    if (!step) {
      return jsonError("invalid-step", 400);
    }

    const state = await setUserOnboardingStep(auth.user.id, step);
    if (!state) {
      return jsonError("user-not-found", 404);
    }

    return jsonOk({
      step: state.onboarding_step,
      completedAt: state.onboarding_completed_at
    });
  } catch {
    return jsonError("onboarding-update-failed", 500);
  }
}
