import { renderToStaticMarkup } from "react-dom/server";
import FreeToolsIndexPage from "./page";

describe("free tools page", () => {
  it("renders the free tools landing page with categories and the ROI calculator", async () => {
    const page = await FreeToolsIndexPage({});
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Free tools for support teams");
    expect(html).toContain("Response Time Calculator");
    expect(html).toContain("Live Chat ROI Calculator");
    expect(html).toContain("Welcome Message Generator");
    expect(html).toContain("Response Template Library");
    expect(html).toContain("Response Tone Checker");
    expect(html).toContain("Calculators");
    expect(html).toContain("Generators");
    expect(html).toContain("Templates");
    expect(html).toContain("Analyzers");
    expect(html).toContain("Ready to put these insights into action?");
    expect(html).toContain("/free-tools/live-chat-roi-calculator");
  });
});
