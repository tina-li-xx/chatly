import { buildAbsoluteUrl, buildBlogPostingSchema, formatBlogDate, formatReadingTime } from "@/lib/blog-utils";
import type { BlogPostWithDetails } from "@/lib/blog-types";
import { BlogArticleBody } from "./blog-article-body";
import { BlogArticleHeader, BlogAuthorCard, BlogRelatedPosts } from "./blog-article-extras";
import { BlogMobileStickyCta } from "./blog-email-capture";
import { BlogShareButtons } from "./blog-share-buttons";
import { BlogShell } from "./blog-shell";
import { BlogTableOfContents } from "./blog-table-of-contents";

export function BlogArticlePage({
  post,
  relatedPosts
}: {
  post: BlogPostWithDetails;
  relatedPosts: BlogPostWithDetails[];
}) {
  const articleUrl = buildAbsoluteUrl(`/blog/${post.slug}`);
  const schema = buildBlogPostingSchema(post);

  return (
    <BlogShell>
      <main className="pb-24">
        <BlogArticleHeader post={post} />

        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#fff7ed_100%)] p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <img src={post.image.src} alt={post.image.alt} className="aspect-[2/1] w-full rounded-[20px] object-cover" />
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span>{formatBlogDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{formatReadingTime(post.readingTime)}</span>
        </div>

        <div className="mx-auto mt-8 max-w-4xl px-4 lg:hidden">
          <BlogShareButtons title={post.title} url={articleUrl} orientation="horizontal" />
        </div>

        <div className="mx-auto mt-12 grid max-w-[1200px] gap-10 px-4 sm:px-6 lg:grid-cols-[200px_minmax(0,680px)_80px] lg:px-8">
          <aside className="hidden lg:block">
            <BlogTableOfContents items={post.sections.map((section) => ({ id: section.id, title: section.title }))} />
          </aside>

          <article>
            <BlogArticleBody post={post} />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BlogShareButtons title={post.title} url={articleUrl} />
            </div>
          </aside>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

        <div className="mx-auto mt-16 max-w-[1000px] px-4 sm:px-6 lg:px-8">
          <BlogAuthorCard author={post.author} />
          <BlogRelatedPosts posts={relatedPosts} />
        </div>

        <BlogMobileStickyCta />
      </main>
    </BlogShell>
  );
}
