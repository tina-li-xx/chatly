import { BlogArticleBody } from "../blog/blog-article-body";
import { formatBlogDate, formatReadingTime } from "@/lib/blog-utils";
import type { BlogPostWithDetails } from "@/lib/blog-types";
import type { GuideArticle } from "@/lib/guide-article";
import { GuidesShell } from "./guides-shell";

const GUIDE_BODY_POST_BASE = {
  authorSlug: "tina",
  categorySlug: "how-to-guides",
  relatedSlugs: [],
  author: {
    slug: "tina",
    name: "Tina",
    role: "Growth & Operations at Chatting",
    bio: "",
    initials: "T",
    links: []
  },
  category: {
    slug: "how-to-guides",
    label: "Guide",
    description: "Product guides and walkthroughs.",
    badgeClassName: "bg-blue-50 text-blue-700"
  }
} as const;

function toBodyPost(guide: GuideArticle): BlogPostWithDetails {
  return {
    ...GUIDE_BODY_POST_BASE,
    ...guide,
    relatedSlugs: [...GUIDE_BODY_POST_BASE.relatedSlugs],
    sections: [...guide.sections],
    author: {
      ...GUIDE_BODY_POST_BASE.author,
      links: [...GUIDE_BODY_POST_BASE.author.links]
    },
    category: { ...GUIDE_BODY_POST_BASE.category }
  };
}

export function GuideArticlePage({ guide }: { guide: GuideArticle }) {
  return (
    <GuidesShell>
      <main className="pb-24">
        <section className="mx-auto max-w-4xl px-4 pb-10 pt-10 text-center sm:px-6 lg:px-8 lg:pb-12 lg:pt-16">
          <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            Guide
          </span>
          <h1 className="display-font mt-5 text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {guide.title}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-xl leading-8 text-slate-600">{guide.subtitle}</p>
        </section>

        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#fff7ed_100%)] p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
            <div className="overflow-hidden rounded-[20px] border border-white/70 bg-white/80 p-3">
              <img src={guide.image.src} alt={guide.image.alt} className="aspect-[2/1] w-full object-contain" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span>{formatBlogDate(guide.publishedAt)}</span>
          <span>•</span>
          <span>{formatReadingTime(guide.readingTime)}</span>
        </div>

        <div className="mx-auto mt-12 max-w-[760px] px-4 sm:px-6 lg:px-8">
          <article>
            <BlogArticleBody post={toBodyPost(guide)} relatedPosts={[]} />
          </article>
        </div>
      </main>
    </GuidesShell>
  );
}
