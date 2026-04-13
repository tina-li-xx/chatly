import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getPublicBlogPostBySlug, getPublicBlogPosts, getPublicRelatedBlogPosts } from "@/lib/public-blog-data";
import { BlogArticlePage } from "../blog-article-page";

type BlogArticleRouteProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublicBlogPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  const canonical = buildAbsoluteUrl(`/blog/${post.slug}`);

  return {
    title: `${post.seoTitle || post.title} | Chatting Blog`,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonical,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      section: post.category.label,
      images: [
        {
          url: buildAbsoluteUrl(post.image.src),
          alt: post.image.alt,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [buildAbsoluteUrl(post.image.src)]
    }
  };
}

export default async function BlogArticleRoute({ params }: BlogArticleRouteProps) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogArticlePage post={post} relatedPosts={await getPublicRelatedBlogPosts(post)} />;
}
