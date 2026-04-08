import type { BlogImage, BlogSection } from "@/lib/blog-types";

export type GuideArticle = {
  slug: string;
  title: string;
  excerpt: string;
  subtitle: string;
  seoTitle: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  image: BlogImage;
  sections: BlogSection[];
};
