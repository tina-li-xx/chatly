import { ChatBubbleIcon, CheckIcon } from "./dashboard/dashboard-ui";
import { ButtonLink } from "./components/ui/Button";
import { PricingPlanCard, type PricingFeatureItem } from "./pricing-plan-card";

const starterFeatures: PricingFeatureItem[] = [
  "50 conversations/month",
  "1 team member",
  "Widget customization",
  "Email notifications"
];

const growthFeatures: PricingFeatureItem[] = [
  "Unlimited conversations",
  {
    label: "Up to 3 team members included",
    note: "Volume pricing from $6/member after that"
  },
  "Proactive chat",
  "Visitor tracking",
  "Advanced analytics",
  "AI assist",
  "Saved replies",
  "API access",
  "Custom branding",
  "White-label widget"
];

export function LandingPricingSection() {
  return (
    <section id="pricing" className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="inline-flex rounded-full bg-blue-50 px-[14px] py-[6px] text-[13px] font-medium text-blue-700">
            Pricing
          </div>
          <h2 className="display-font mt-4 text-4xl leading-tight text-slate-900 sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-500">Start 14 day free trial. Upgrade when you&apos;re ready.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[820px] gap-6 md:grid-cols-2">
          <PricingPlanCard
            planKey="starter"
            interval="monthly"
            className="order-2 md:order-1"
            displayPriceOverride={{ amount: "Free", cadence: "", note: null }}
            featureItems={starterFeatures}
            priceNotePlacement="hidden"
            summaryLabel="For testing the waters"
            action={
              <ButtonLink href="/signup" variant="secondary" fullWidth className="h-12 rounded-[10px] border-slate-300 text-[15px]">
                Start 14 day free trial →
              </ButtonLink>
            }
          />
          <PricingPlanCard
            planKey="growth"
            interval="monthly"
            className="order-1 md:order-2"
            displayPriceOverride={{ amount: "$20", cadence: "/month", note: null }}
            featureItems={growthFeatures}
            priceNotePlacement="hidden"
            summaryLabel="For teams ready to convert"
            action={
              <ButtonLink href="/signup" fullWidth className="h-12 rounded-[10px] text-[15px] shadow-[0_4px_12px_rgba(37,99,235,0.25)]">
                Start 14 day free trial →
              </ButtonLink>
            }
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span>No credit card required</span>
        </div>

        <div className="mx-auto mt-10 max-w-[820px] rounded-[16px] border border-slate-200 bg-white px-7 py-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-blue-600">
              <ChatBubbleIcon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">What if I need more than 3 members?</h3>
              <p className="mt-2 text-[15px] leading-7 text-slate-600">
                No problem. After 3, it&apos;s just <span className="font-semibold text-slate-700">$6/member/month</span>.
                {" "}A team of 10 costs <span className="font-semibold text-slate-700">$62/month</span>. Still cheaper
                than one Intercom seat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
