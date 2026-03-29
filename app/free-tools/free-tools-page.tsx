import type { FreeTool, FreeToolCategory, FreeToolCategorySlug } from "@/lib/free-tools-data";
import { BlogShell } from "../blog/blog-shell";
import {
  FeaturedFreeTool,
  FreeToolCard,
  FreeToolCategoryTabs,
  FreeToolsCtaBanner
} from "./free-tools-sections";

export function FreeToolsPage({
  featuredTool,
  tools,
  selectedCategory,
  category = null
}: {
  featuredTool: FreeTool | null;
  tools: FreeTool[];
  selectedCategory: FreeToolCategorySlug | "all";
  category?: FreeToolCategory | null;
}) {
  const showFeatured = selectedCategory === "all" && tools.length > 1 && featuredTool;
  const gridTools = showFeatured ? tools.filter((tool) => tool.slug !== featuredTool.slug) : tools;
  const eyebrow = category ? category.label : "Free Tools";
  const title = category ? `Free ${category.label.toLowerCase()} for support teams` : "Free tools for support teams";
  const subtitle = category
    ? `${category.description} Built for small teams and ready to use without a signup.`
    : "Calculators, generators, and templates to help you deliver better customer conversations. No signup required.";

  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <section className="px-1 pb-10 pt-4 text-center sm:pb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">{eyebrow}</p>
            <h1 className="display-font mt-4 mx-auto max-w-4xl text-5xl leading-[1.05] text-slate-900 sm:text-6xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">{subtitle}</p>
          </section>

          <section className="mt-2">
            <FreeToolCategoryTabs selectedCategory={selectedCategory} />
          </section>

          {showFeatured ? (
            <section className="mt-10">
              <FeaturedFreeTool tool={featuredTool} />
            </section>
          ) : null}

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {gridTools.map((tool) => (
              <FreeToolCard key={tool.slug} tool={tool} />
            ))}
          </section>

          {gridTools.length === 0 ? (
            <section className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">More on the way</p>
              <p className="mt-3 text-base leading-7 text-slate-600">
                This category is next in the queue. Switch back to All to see the live tools already available.
              </p>
            </section>
          ) : null}

          <div className="mt-14">
            <FreeToolsCtaBanner />
          </div>
        </div>
      </main>
    </BlogShell>
  );
}
