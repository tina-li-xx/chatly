import Link from "next/link";
import type { BlogCategorySlug, BlogPostWithDetails } from "@/lib/blog-types";
import { formatBlogDate, formatReadingTime } from "@/lib/blog-utils";
import { BlogCategoryBadge, BlogAuthorAvatar } from "./blog-primitives";

export function FeaturedBlogPost({ post }: { post: BlogPostWithDetails }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="grid gap-10 border-b border-slate-200 pb-12 transition sm:pb-16 lg:grid-cols-[1.12fr_0.88fr] lg:items-center"
    >
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#fff7ed_100%)] p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
        <img src={post.image.src} alt={post.image.alt} className="aspect-[16/9] w-full rounded-[20px] object-cover" />
      </div>

      <div>
        <BlogCategoryBadge category={post.category} />
        <h2 className="display-font mt-5 text-4xl leading-tight text-slate-900 sm:text-5xl">{post.title}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{post.excerpt}</p>
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
          <BlogAuthorAvatar author={post.author} size="sm" />
          <span className="font-medium text-slate-900">{post.author.name}</span>
          <span>•</span>
          <span>{formatBlogDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{formatReadingTime(post.readingTime)}</span>
        </div>
      </div>
    </Link>
  );
}

export function BlogCategoryFilter({
  selectedCategory
}: {
  selectedCategory: BlogCategorySlug | "all";
}) {
  const filters: Array<{ label: string; href: string; active: boolean }> = [
    { label: "All", href: "/blog", active: selectedCategory === "all" },
    {
      label: "Live Chat Tips",
      href: "/blog?category=live-chat-tips",
      active: selectedCategory === "live-chat-tips"
    },
    { label: "Small Teams", href: "/blog?category=small-teams", active: selectedCategory === "small-teams" },
    { label: "Conversion", href: "/blog?category=conversion", active: selectedCategory === "conversion" },
    { label: "How-To Guides", href: "/blog?category=how-to-guides", active: selectedCategory === "how-to-guides" },
    { label: "Product", href: "/blog?category=product", active: selectedCategory === "product" },
    { label: "Comparisons", href: "/blog?category=comparisons", active: selectedCategory === "comparisons" }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {filters.map((filter) => (
        <a
          key={filter.label}
          href={filter.href}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
            filter.active ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {filter.label}
        </a>
      ))}
    </div>
  );
}

export function BlogPostCard({ post }: { post: BlogPostWithDetails }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(15,23,42,0.08)]"
    >
      <div className="overflow-hidden bg-slate-50">
        <img
          src={post.image.src}
          alt={post.image.alt}
          className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="px-6 py-6">
        <BlogCategoryBadge category={post.category} />
        <h3 className="mt-3 line-clamp-2 text-xl font-semibold leading-8 text-slate-900">{post.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-900">{post.author.name}</span>
          <span>•</span>
          <span>{formatBlogDate(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
