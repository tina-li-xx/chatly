import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticlePage } from "../guide-article-page";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getAllGuides, getGuideBySlug } from "@/lib/guides-data";

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return {};
  }

  const guidePath = `/guides/${guide.slug}`;

  return {
    title: `${guide.seoTitle} | Chatting`,
    description: guide.excerpt,
    alternates: { canonical: buildAbsoluteUrl(guidePath) },
    openGraph: {
      title: guide.title,
      description: guide.excerpt,
      url: buildAbsoluteUrl(guidePath),
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      images: [
        {
          url: buildAbsoluteUrl(guide.image.src),
          alt: guide.image.alt,
          width: 1200,
          height: 630
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.excerpt,
      images: [buildAbsoluteUrl(guide.image.src)]
    }
  };
}

export default async function GuideArticleRoute({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    notFound();
  }

  return <GuideArticlePage guide={guide} />;
}
