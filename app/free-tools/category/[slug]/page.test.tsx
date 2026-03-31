import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getFreeToolCategory: vi.fn(),
  getFreeToolsByCategory: vi.fn(),
  notFound: vi.fn()
}));

vi.mock("next/navigation", () => ({
  notFound: mocks.notFound
}));

vi.mock("@/lib/blog-utils", () => ({
  buildAbsoluteUrl: (path: string) => `https://usechatting.com${path}`
}));

vi.mock("@/lib/free-tools-data", () => ({
  freeToolCategories: [
    { slug: "calculator", label: "Calculators", description: "Quick support calculators" },
    { slug: "templates", label: "Templates", description: "Helpful canned replies" }
  ],
  getFreeToolCategory: mocks.getFreeToolCategory,
  getFreeToolsByCategory: mocks.getFreeToolsByCategory
}));

vi.mock("../../free-tools-page", () => ({
  FreeToolsPage: ({
    category,
    tools,
    selectedCategory
  }: {
    category: { slug: string };
    tools: { slug: string }[];
    selectedCategory: string;
  }) => (
    <div>
      <span>{category.slug}</span>
      <span>{selectedCategory}</span>
      <span>{tools.map((tool) => tool.slug).join(",")}</span>
    </div>
  )
}));

import FreeToolCategoryRoute, { generateMetadata, generateStaticParams } from "./page";

describe("free tool category route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
  });

  it("builds static params from every free tool category", async () => {
    await expect(generateStaticParams()).resolves.toEqual([
      { slug: "calculator" },
      { slug: "templates" }
    ]);
  });

  it("renders metadata and the category page for known categories", async () => {
    mocks.getFreeToolCategory.mockReturnValue({ slug: "calculator", label: "Calculators", description: "Quick support calculators" });
    mocks.getFreeToolsByCategory.mockReturnValue([{ slug: "roi" }, { slug: "response-time" }]);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "calculator" }) });
    const html = renderToStaticMarkup(
      (await FreeToolCategoryRoute({
        params: Promise.resolve({ slug: "calculator" })
      })) as ReactNode
    );

    expect(metadata.title).toBe("Free Calculators for Support Teams | Chatting");
    expect(String(metadata.alternates?.canonical)).toContain("/free-tools/category/calculator");
    expect(html).toContain("calculator");
    expect(html).toContain("roi,response-time");
  });

  it("returns empty metadata and delegates unknown categories to notFound", async () => {
    mocks.getFreeToolCategory.mockReturnValue(null);

    await expect(generateMetadata({ params: Promise.resolve({ slug: "missing" }) })).resolves.toEqual({});
    await expect(
      FreeToolCategoryRoute({
        params: Promise.resolve({ slug: "missing" })
      })
    ).rejects.toThrow("NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalled();
  });
});
