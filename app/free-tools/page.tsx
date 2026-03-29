import type { Metadata } from "next";
import {
  getFeaturedFreeTool,
  getFreeToolsByCategory,
  isFreeToolCategorySlug
} from "@/lib/free-tools-data";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { FreeToolsPage } from "./free-tools-page";

type FreeToolsIndexPageProps = {
  searchParams?: Promise<{ category?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Free Tools for Support Teams | Chatting",
  description:
    "Calculators, generators, and templates from Chatting to help small teams improve response times, support quality, and conversion.",
  alternates: { canonical: buildAbsoluteUrl("/free-tools") }
};

export default async function FreeToolsIndexPage({ searchParams }: FreeToolsIndexPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const categoryParam = Array.isArray(resolvedParams.category)
    ? resolvedParams.category[0]
    : resolvedParams.category;
  const selectedCategory = categoryParam && isFreeToolCategorySlug(categoryParam) ? categoryParam : "all";
  const tools = getFreeToolsByCategory(selectedCategory);
  const featuredTool = selectedCategory === "all" ? getFeaturedFreeTool() : null;

  return <FreeToolsPage featuredTool={featuredTool} tools={tools} selectedCategory={selectedCategory} />;
}
