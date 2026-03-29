import { renderToStaticMarkup } from "react-dom/server";
import FreeToolCategoryRoute from "./category/[slug]/page";

describe("free tool category page", () => {
  it("renders a category-specific landing page", async () => {
    const page = await FreeToolCategoryRoute({ params: Promise.resolve({ slug: "calculators" }) });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Free calculators for support teams");
    expect(html).toContain("Response Time Calculator");
    expect(html).toContain("Live Chat ROI Calculator");
    expect(html).not.toContain("Welcome Message Generator");
    expect(html).toContain("/free-tools/category/calculators");
  });
});
