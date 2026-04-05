import { codeSnippet, setupSteps } from "./landing-page-data";
import { LandingPricingSection } from "./landing-page-pricing-section";
import { SectionLabel } from "./landing-page-primitives";

export function LandingConversionSections() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <section id="how-it-works" className="grid gap-14 px-2 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <SectionLabel>Getting Started</SectionLabel>
              <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">Live in 3 minutes. Seriously.</h2>

              <div className="mt-10 space-y-8">
                {setupSteps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="docs" className="overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">Install snippet</p>
              <pre className="mt-5 overflow-x-auto rounded-[22px] bg-slate-900 p-5 text-xs leading-7 text-slate-100">
                <code>{codeSnippet()}</code>
              </pre>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Add our tiny script to your site. That&apos;s it. Works with any website, WordPress, Webflow, Shopify,
                custom code.
              </p>
            </div>
          </section>
        </div>
      </section>

      <LandingPricingSection />
    </>
  );
}
