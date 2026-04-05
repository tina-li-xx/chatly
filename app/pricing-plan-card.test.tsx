import { renderToStaticMarkup } from "react-dom/server";
import { PricingPlanCard } from "./pricing-plan-card";

describe("pricing plan card", () => {
  it("renders the shared growth card with the note under the team-members feature", () => {
    const html = renderToStaticMarkup(
      <PricingPlanCard
        planKey="growth"
        interval="monthly"
        priceNotePlacement="feature"
        action={<div>Upgrade</div>}
      />
    );

    expect(html).toContain("Recommended");
    expect(html).toContain("Growth");
    expect(html).toContain("$20");
    expect(html).toContain("1-3 team members included");
    expect(html).toContain("1-3 members, then volume pricing from $6/member/month");
    expect(html).toContain("API access");
  });

  it("supports the landing-card overrides without the old top price note", () => {
    const html = renderToStaticMarkup(
      <PricingPlanCard
        planKey="starter"
        interval="monthly"
        displayPriceOverride={{ amount: "Free", cadence: "", note: null }}
        featureItems={["50 conversations/month", "1 team member"]}
        priceNotePlacement="hidden"
        summaryLabel="For testing the waters"
        action={<div>Start free →</div>}
      />
    );

    expect(html).toContain("Starter");
    expect(html).toContain("Free");
    expect(html).toContain("For testing the waters");
    expect(html).toContain("50 conversations/month");
    expect(html).not.toContain("$0/month");
  });
});
