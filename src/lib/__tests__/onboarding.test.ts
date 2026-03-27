import { normalizeOnboardingStep, onboardingPathForStep } from "@/lib/data/onboarding";

describe("onboarding helpers", () => {
  it("normalizes valid onboarding steps", () => {
    expect(normalizeOnboardingStep("team", "signup")).toBe("customize");
    expect(normalizeOnboardingStep("done", "team")).toBe("done");
    expect(normalizeOnboardingStep("unknown", "customize")).toBe("customize");
  });

  it("maps onboarding steps to app paths", () => {
    expect(onboardingPathForStep("team")).toBe("/onboarding?step=customize");
    expect(onboardingPathForStep("install")).toBe("/onboarding?step=install");
    expect(onboardingPathForStep("done")).toBe("/dashboard");
  });
});
