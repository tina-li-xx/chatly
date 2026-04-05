import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBlogAuthors, getBlogAuthorBySlug, getBlogPostsByAuthor } from "@/lib/blog-data";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { buildDefaultSocialMetadata } from "@/lib/site-seo";
import { BlogPostCard } from "../../blog-home-sections";
import { BlogAuthorAvatar } from "../../blog-primitives";
import { BlogShell } from "../../blog-shell";

type BlogAuthorRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: BlogAuthorRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getBlogAuthorBySlug(slug);

  if (!author) {
    return {};
  }

  const canonical = buildAbsoluteUrl(`/blog/authors/${author.slug}`);

  return {
    title: `${author.name} | Chatting Blog`,
    description: author.bio,
    alternates: { canonical },
    ...buildDefaultSocialMetadata({
      title: `${author.name} | Chatting Blog`,
      description: author.bio,
      url: canonical,
      openGraphType: "profile"
    })
  };
}

export default async function BlogAuthorRoute({ params }: BlogAuthorRouteProps) {
  const { slug } = await params;
  const author = getBlogAuthorBySlug(slug);

  if (!author) {
    return notFound();
  }

  const posts = getBlogPostsByAuthor(author.slug);

  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <Link href="/blog" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
            Back to blog
          </Link>

          <section className="mt-6 rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.55),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#fff7ed_100%)] px-6 py-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)] sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <BlogAuthorAvatar author={author} size="lg" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Author</p>
                  <h1 className="display-font mt-2 text-4xl leading-tight text-slate-900 sm:text-5xl">{author.name}</h1>
                  <p className="mt-2 text-sm font-medium text-slate-600">{author.role}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {posts.length} post{posts.length === 1 ? "" : "s"}
              </p>
            </div>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{author.bio}</p>

            <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-blue-600">
              {author.links.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="transition hover:text-blue-700">
                  {link.label}
                </a>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="display-font text-3xl text-slate-900">Posts by {author.name}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Browse every article from {author.name} on live chat, conversion, and small-team support.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </BlogShell>
  );
}
