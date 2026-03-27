import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createSiteForUser, getOnboardingData } from "@/lib/data";
import { normalizeOnboardingStep } from "@/lib/data/onboarding";
import type { OnboardingStep, Site } from "@/lib/types";
import { OnboardingFlow } from "./onboarding-flow";

type OnboardingFlowStep = Exclude<OnboardingStep, "signup" | "team">;

function resolveInitialStep(input: {
  requestedStep: string | undefined;
  persistedStep: OnboardingStep;
}): OnboardingFlowStep {
  const requestedStep = normalizeOnboardingStep(input.requestedStep, input.persistedStep) as OnboardingFlowStep;

  if (input.persistedStep === "done") {
    return "done";
  }

  const normalizedPersistedStep = normalizeOnboardingStep(input.persistedStep, "customize") as OnboardingFlowStep;
  const order = ["customize", "install"] as const;
  const persistedIndex = order.indexOf(normalizedPersistedStep as (typeof order)[number]);
  const requestedIndex = order.indexOf(requestedStep as (typeof order)[number]);

  if (requestedIndex === -1 || requestedIndex > persistedIndex) {
    return normalizedPersistedStep;
  }

  return requestedStep;
}

export async function OnboardingEntry({
  requestedStep
}: {
  requestedStep?: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signup");
  }

  const onboarding = await getOnboardingData(user.id);
  let site: Site | null = onboarding.site;

  if (!site) {
    site = await createSiteForUser(user.id, {
      name: "My site"
    });
  }

  const initialStep = resolveInitialStep({
    requestedStep,
    persistedStep: onboarding.step
  });

  if (onboarding.step === "done" && requestedStep !== "done") {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      initialStep={initialStep}
      initialSite={site}
    />
  );
}
