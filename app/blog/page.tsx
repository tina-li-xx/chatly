import type { Metadata } from "next";
import { getBlogPostsByCategory, getFeaturedBlogPost, isBlogCategorySlug } from "@/lib/blog-data";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { BlogHomePage } from "./blog-home-page";

type BlogIndexPageProps = {
  searchParams?: Promise<{ category?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Chatting Blog",
  description:
    "Read practical advice for small teams using live chat to support customers, answer buyers faster, and grow without sounding robotic.",
  alternates: {
    canonical: buildAbsoluteUrl("/blog")
  }
};

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const categoryParam = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category;
  const selectedCategory = categoryParam && isBlogCategorySlug(categoryParam) ? categoryParam : "all";
  const featuredPost = getFeaturedBlogPost();
  const posts = getBlogPostsByCategory(selectedCategory).length
    ? getBlogPostsByCategory(selectedCategory)
    : getBlogPostsByCategory("all");

  const homeFeaturedPost =
    selectedCategory === "all" || featuredPost.category.slug === selectedCategory ? featuredPost : posts[0];

  return (
    <BlogHomePage
      featuredPost={homeFeaturedPost}
      posts={posts}
      selectedCategory={selectedCategory}
    />
  );
}
