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

import { LandingGrowthPricingCard } from "./landing-page-pricing-cards";

describe("landing page pricing cards", () => {
  it("shows slider-aware growth pricing totals", () => {
    const html = renderToStaticMarkup(
      <LandingGrowthPricingCard interval="monthly" memberCount={31} />
    );

    expect(html).toContain("Growth");
    expect(html).toContain("$124");
    expect(html).toContain("/month");
    expect(html).toContain("1-3 members, then volume pricing from $6/member/month");
  });

  it("shows custom pricing when the slider reaches 50+ members", () => {
    const html = renderToStaticMarkup(
      <LandingGrowthPricingCard interval="monthly" memberCount={50} />
    );

    expect(html).toContain("Custom");
    expect(html).toContain("50+ members");
  });
});
