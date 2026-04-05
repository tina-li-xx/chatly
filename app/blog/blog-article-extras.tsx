import type { Route } from "next";
import Link from "next/link";
import type { BlogAuthor, BlogPostWithDetails } from "@/lib/blog-types";
import { BlogAuthorAvatar, BlogCategoryBadge } from "./blog-primitives";
import { BlogPostCard } from "./blog-home-sections";

export function BlogAuthorCard({ author }: { author: BlogAuthor }) {
  const authorHref = `/blog/authors/${author.slug}` as Route;

  return (
    <section className="rounded-[24px] bg-slate-50 px-6 py-6 sm:flex sm:items-start sm:gap-5">
      <div className="shrink-0">
        <BlogAuthorAvatar author={author} size="lg" />
      </div>
      <div className="mt-4 sm:mt-0">
        <Link href={authorHref} className="inline-block">
          <h3 className="text-xl font-semibold text-slate-900 transition hover:text-blue-700">{author.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-slate-500">{author.role}</p>
        <p className="mt-3 text-[15px] leading-7 text-slate-600">{author.bio}</p>
        <div className="mt-4 flex gap-4 text-sm font-medium text-blue-600">
          {author.links.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogArticleHeader({ post }: { post: BlogPostWithDetails }) {
  const authorHref = `/blog/authors/${post.author.slug}` as Route;

  return (
    <section className="mx-auto max-w-4xl px-4 pb-10 pt-10 text-center sm:px-6 lg:px-8 lg:pb-12 lg:pt-16">
      <BlogCategoryBadge category={post.category} />
      <h1 className="display-font mt-5 text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-6xl">{post.title}</h1>
      <p className="mx-auto mt-5 max-w-3xl text-xl leading-8 text-slate-600">{post.subtitle}</p>
      <div className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
        <BlogAuthorAvatar author={post.author} />
        <Link href={authorHref} className="font-medium text-slate-900 transition hover:text-blue-700">
          {post.author.name}
        </Link>
      </div>
    </section>
  );
}

export function BlogRelatedPosts({ posts }: { posts: BlogPostWithDetails[] }) {
  return (
    <section className="mt-14">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Related posts</p>
      <h2 className="display-font mt-3 text-3xl text-slate-900">You might also like</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
