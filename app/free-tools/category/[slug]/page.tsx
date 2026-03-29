import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import {
  freeToolCategories,
  getFreeToolCategory,
  getFreeToolsByCategory,
  type FreeToolCategorySlug
} from "@/lib/free-tools-data";
import { FreeToolsPage } from "../../free-tools-page";

type FreeToolCategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return freeToolCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: FreeToolCategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getFreeToolCategory(slug);

  if (!category) {
    return {};
  }

  return {
    title: `Free ${category.label} for Support Teams | Chatting`,
    description: `${category.description} Free tools from Chatting for small support teams.`,
    alternates: { canonical: buildAbsoluteUrl(`/free-tools/category/${category.slug}`) }
  };
}

export default async function FreeToolCategoryRoute({ params }: FreeToolCategoryRouteProps) {
  const { slug } = await params;
  const category = getFreeToolCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <FreeToolsPage
      category={category}
      featuredTool={null}
      tools={getFreeToolsByCategory(category.slug as FreeToolCategorySlug)}
      selectedCategory={category.slug as FreeToolCategorySlug}
    />
  );
}
