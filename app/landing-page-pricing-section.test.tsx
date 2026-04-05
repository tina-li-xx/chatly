import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

import { LandingPricingSection } from "./landing-page-pricing-section";

describe("landing page pricing section", () => {
  it("renders the simplified two-plan layout", () => {
    const html = renderToStaticMarkup(<LandingPricingSection />);

    expect(html).toContain("Simple, transparent pricing");
    expect(html).toContain("Start 14 day free trial. Upgrade when you&#x27;re ready.");
    expect(html).toContain("Starter");
    expect(html).toContain("Growth");
    expect(html).toContain("Recommended");
    expect(html).not.toContain("How many team members?");
    expect(html).not.toContain("Preview Growth pricing.");
    expect(html).toContain("Start 14 day free trial →");
    expect(html).toContain("No credit card required");
    expect(html).toContain("What if I need more than 3 members?");
    expect(html).toContain("$6/member/month");
    expect(html).toContain("$62/month");
  });
});
