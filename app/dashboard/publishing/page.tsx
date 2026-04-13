import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canAccessDashboardPublishing } from "@/lib/dashboard-publishing-access";
import { resolvePublishingSection } from "../dashboard-publishing-section";
import {
  buildSwitchboardSectionHref,
  getSwitchboardSectionForPublishing
} from "../dashboard-switchboard-section";

type PublishingPageProps = {
  searchParams?: Promise<{
    section?: string | string[];
  }>;
};

export default async function PublishingPage({ searchParams }: PublishingPageProps = {}) {
  const params = (await searchParams) ?? {};
  const user = await requireUser();
  const requestedSection = Array.isArray(params.section) ? params.section[0] : params.section;
  const activeSection = resolvePublishingSection(requestedSection);

  if (!canAccessDashboardPublishing(user.email)) {
    notFound();
  }

  redirect(buildSwitchboardSectionHref(getSwitchboardSectionForPublishing(activeSection)));
}
