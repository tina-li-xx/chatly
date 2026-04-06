import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHelpCenterArticleForSite } from "@/lib/data";
import { NO_INDEX_METADATA } from "@/lib/site-seo";
import { HelpCenterBody, HelpCenterShell, formatHelpCenterDate } from "../../help-center-shell";

type HelpCenterArticleRouteProps = {
  params: Promise<{ siteId: string; slug: string }>;
};

export const metadata: Metadata = {
  title: "Help Article | Chatting",
  ...NO_INDEX_METADATA
};

export default async function HelpCenterArticlePage({ params }: HelpCenterArticleRouteProps) {
  const { siteId, slug } = await params;
  const data = await getHelpCenterArticleForSite(siteId, slug);

  if (!data) {
    notFound();
  }

  return (
    <HelpCenterShell
      siteName={data.site.name}
      title={data.article.title}
      intro={`Published for quick self-serve answers. Updated ${formatHelpCenterDate(data.article.updatedAt)}.`}
      backHref={`/help/${siteId}`}
      backLabel="All articles"
    >
      <HelpCenterBody body={data.article.body} />
    </HelpCenterShell>
  );
}
