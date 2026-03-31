import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FreeToolBenchmarkBar,
  FreeToolBreadcrumb,
  FreeToolContextualCta,
  FreeToolEmptyResults,
  FreeToolFaq,
  FreeToolGradeCard,
  FreeToolHero,
  FreeToolMetricCard,
  FreeToolMobileStickyCta,
  FreeToolRelated
} from "./free-tool-page-shared";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a>
}));

const tool = {
  slug: "response-time-calculator",
  href: "/free-tools/response-time-calculator",
  iconLabel: "RT",
  title: "Response Time Calculator",
  excerpt: "Measure response speed."
};

describe("free tool page shared components", () => {
  it("renders the shared shells, ctas, and content blocks", () => {
    const html = renderToStaticMarkup(
      <>
        <FreeToolBreadcrumb title="Response Time Calculator" />
        <FreeToolHero tool={tool} subtitle="Fast replies matter." />
        <FreeToolContextualCta title="Automate this" body="Track it in real time." />
        <FreeToolMobileStickyCta />
        <FreeToolMetricCard label="Average" value="12 min" />
        <FreeToolEmptyResults title="No results yet" body="Add your numbers first." />
        <FreeToolFaq items={[{ question: "Why?", answer: "Because speed matters." }]} />
        <FreeToolRelated tools={[tool]} />
      </>
    );

    expect(html).toContain("Free Tools");
    expect(html).toContain("Fast replies matter.");
    expect(html).toContain("Try Chatting free");
    expect(html).toContain("No results yet");
    expect(html).toContain("Because speed matters.");
    expect(html).toContain("/free-tools/response-time-calculator");
  });

  it("covers every benchmark and grade styling branch", () => {
    const html = renderToStaticMarkup(
      <>
        <FreeToolGradeCard grade="A+" descriptor="Excellent" />
        <FreeToolGradeCard grade="B" descriptor="Strong" />
        <FreeToolGradeCard grade="C" descriptor="Okay" />
        <FreeToolGradeCard grade="D" descriptor="Needs work" />
        <FreeToolBenchmarkBar average={12} top={5} current={18} />
      </>
    );

    expect(html).toContain("A+");
    expect(html).toContain("B");
    expect(html).toContain("C");
    expect(html).toContain("D");
    expect(html).toContain("Top performers: 5 min");
    expect(html).toContain("Industry average: 12 min");
    expect(html).toContain("Your time: 18 min");
  });
});
