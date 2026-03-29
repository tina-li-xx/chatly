import type { BlogCategorySlug, BlogPostWithDetails } from "@/lib/blog-types";
import { BlogNewsletterCard } from "./blog-email-capture";
import { BlogCategoryFilter, BlogPostCard, FeaturedBlogPost } from "./blog-home-sections";
import { BlogShell } from "./blog-shell";

export function BlogHomePage({
  featuredPost,
  posts,
  selectedCategory
}: {
  featuredPost: BlogPostWithDetails;
  posts: BlogPostWithDetails[];
  selectedCategory: BlogCategorySlug | "all";
}) {
  const gridPosts = posts.filter((post) => post.slug !== featuredPost.slug);

  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <section className="px-1 pb-10 pt-4 sm:pb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Chatting Blog</p>
            <h1 className="display-font mt-4 max-w-4xl text-5xl leading-[1.05] text-slate-900 sm:text-6xl">
              Advice for warmer conversations and faster support.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Practical live chat guidance for small teams that need to educate, convert, and support without sounding like a script.
            </p>
          </section>

          <FeaturedBlogPost post={featuredPost} />

          <section className="mt-10">
            <BlogCategoryFilter selectedCategory={selectedCategory} />
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {gridPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </section>

          {gridPosts.length === 0 ? (
            <section className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">More on the way</p>
              <p className="mt-3 text-base leading-7 text-slate-600">
                We’re building out this category next. In the meantime, the featured article above is the best place to start.
              </p>
            </section>
          ) : null}

          <div className="mt-14">
            <BlogNewsletterCard />
          </div>
        </div>
      </main>
    </BlogShell>
  );
}
