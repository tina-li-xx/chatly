import Link from "next/link";
import { BlogArticleBody } from "../blog/blog-article-body";
import { BlogAuthorCard, BlogRelatedPosts } from "../blog/blog-article-extras";
import { BlogCategoryBadge } from "../blog/blog-primitives";
import type { BlogPostWithDetails } from "@/lib/blog-types";
import { formatBlogDate, formatReadingTime } from "@/lib/blog-utils";
import { DashboardPublishingApprovalButtons } from "./dashboard-publishing-approval-buttons";
import { formatPublishingStatusLabel } from "./dashboard-publishing-formatting";
import { buildPublishingSectionHref } from "./dashboard-publishing-section";

export function DashboardPublishingPreviewPage({
  post,
  relatedPosts,
  draft
}: {
  post: BlogPostWithDetails;
  relatedPosts: BlogPostWithDetails[];
  draft?: { id: string; workflowStatus: string; publicationStatus: string } | null;
}) {
  const isDraftPreview = draft?.publicationStatus === "draft";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={buildPublishingSectionHref(isDraftPreview ? "drafts" : "queue")}
              className="inline-flex text-sm font-medium text-blue-600 transition hover:text-blue-700"
            >
              {isDraftPreview ? "← Back to drafts" : "← Back to queue"}
            </Link>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              {isDraftPreview ? "Preview article draft" : "Preview queued article"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {isDraftPreview
                ? "This internal preview shows the current draft exactly as it stands before scheduling or publishing."
                : "This internal preview shows the queued article exactly as it stands before it goes live."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
              <span>Workflow</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold uppercase tracking-[0.16em] text-slate-600">
                {formatPublishingStatusLabel(draft?.workflowStatus || "draft")}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
              <span>Publication</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold uppercase tracking-[0.16em] text-slate-600">
                {formatPublishingStatusLabel(draft?.publicationStatus || post.publicationStatus || "draft")}
              </span>
            </div>
          </div>
        </div>
        {draft ? (
          <div className="mt-5">
            <DashboardPublishingApprovalButtons
              draftId={draft.id}
              workflowStatus={draft.workflowStatus}
              publicationStatus={draft.publicationStatus}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <BlogCategoryBadge category={post.category} />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-slate-600">{post.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{post.author.name}</span>
            <span>•</span>
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{formatReadingTime(post.readingTime)}</span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[1000px] overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#fff7ed_100%)] p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <img src={post.image.src} alt={post.image.alt} className="aspect-[2/1] w-full rounded-[20px] object-cover" />
        </div>

        <div className="mx-auto mt-12 max-w-[1200px]">
          <div className="mx-auto max-w-[680px]">
            <BlogArticleBody post={post} relatedPosts={relatedPosts} />
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <BlogAuthorCard author={post.author} />
        {relatedPosts.length > 0 ? <BlogRelatedPosts posts={relatedPosts} /> : null}
      </div>
    </div>
  );
}
