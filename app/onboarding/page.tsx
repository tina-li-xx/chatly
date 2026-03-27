import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingEntry } from "./onboarding-entry";

type OnboardingPageProps = {
  searchParams?: Promise<{
    step?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = (await searchParams) ?? {};
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signup");
  }

  return <OnboardingEntry requestedStep={params.step} />;
}
