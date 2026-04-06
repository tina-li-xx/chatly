import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listHelpCenterArticlesForSite } from "@/lib/data";
import { NO_INDEX_METADATA } from "@/lib/site-seo";
import { HelpCenterShell, formatHelpCenterDate } from "../help-center-shell";

type HelpCenterIndexRouteProps = {
  params: Promise<{ siteId: string }>;
};

export const metadata: Metadata = {
  title: "Help Center | Chatting",
  ...NO_INDEX_METADATA
};

export default async function HelpCenterIndexPage({ params }: HelpCenterIndexRouteProps) {
  const { siteId } = await params;
  const data = await listHelpCenterArticlesForSite(siteId);

  if (!data) {
    notFound();
  }

  function preview(body: string) {
    const text = body.replace(/\s+/g, " ").trim();
    return text.length > 180 ? `${text.slice(0, 177)}...` : text;
  }

  return (
    <HelpCenterShell
      siteName={data.site.name}
      title="Answers your team can link during chat"
      intro="Browse the published articles below, or share these links directly when visitors ask the same question more than once."
    >
      {data.articles.length ? (
        <div className="space-y-4">
          {data.articles.map((article) => (
            <Link key={article.id} href={`/help/${siteId}/${article.slug}`} className="block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 transition hover:border-blue-200 hover:bg-blue-50/60">
              <p className="text-lg font-semibold text-slate-900">{article.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{preview(article.body)}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">Updated {formatHelpCenterDate(article.updatedAt)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-sm text-slate-500">
          No articles have been published here yet.
        </div>
      )}
    </HelpCenterShell>
  );
}
