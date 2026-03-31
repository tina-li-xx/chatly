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
  it("renders the billing-style starter and growth pricing cards", () => {
    const html = renderToStaticMarkup(<LandingPricingSection />);

    expect(html).toContain("Simple, transparent pricing");
    expect(html).toContain("Starter");
    expect(html).toContain("Growth");
    expect(html).toContain("How many team members?");
    expect(html).not.toContain("Preview Growth pricing.");
    expect(html).toContain("1 team member");
    expect(html).toContain("$0");
    expect(html).toContain("$20");
    expect(html).toContain("/month");
    expect(html).toContain("Get started free");
    expect(html).toContain("Start free trial");
    expect(html).toContain("No credit card required");
  });
});
