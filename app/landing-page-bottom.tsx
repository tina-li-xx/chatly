import Link from "next/link";
import { CheckIcon } from "./dashboard/dashboard-ui";
import { codeSnippet, plans, setupSteps, stats, testimonials } from "./landing-page-data";
import { LandingFinalCtaFooter } from "./landing-page-final-cta-footer";
import { SectionLabel } from "./landing-page-primitives";

export function LandingBottomSections() {
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-14 px-2 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <h2 className="display-font text-4xl text-slate-900 sm:text-5xl">One inbox for your entire team</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Every conversation in one place. See who&apos;s handling what. Jump in when teammates need backup.
                No more &ldquo;Did anyone reply to this?&rdquo;
              </p>
              <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-600">
                <li>All conversations, one view</li>
                <li>Filter by open, resolved, or everything</li>
                <li>Assign, tag, and hand off seamlessly</li>
                <li>Keyboard shortcuts for power users</li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-[34px] border border-slate-200/90 bg-[#FCFDFE] shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
              <div className="grid min-h-[540px] lg:grid-cols-[192px_minmax(0,1.35fr)_208px]">
                <div className="border-b border-slate-200 bg-slate-50/80 p-4 lg:border-b-0 lg:border-r">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 font-medium text-slate-700">
                      <span>All</span>
                      <span>12</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[18px] bg-blue-50 px-4 py-3 font-medium text-blue-700">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-[radial-gradient(circle_at_30%_30%,#60A5FA,transparent_28%),#2563EB]" />
                        Open
                      </span>
                      <span>5</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <CheckIcon className="h-4 w-4" />
                        Resolved
                      </span>
                      <span>7</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      ["Alex Chen", "2m", "Quick question about pricing..."],
                      ["Emma Wilson", "8m", "Is there a free trial?"],
                      ["Jordan Park", "1h", "Thanks for the help!"]
                    ].map(([name, time, preview], index) => (
                      <div
                        key={name}
                        className={`rounded-[22px] border px-4 py-3 text-sm ${
                          index === 0
                            ? "border-blue-200 bg-white shadow-[0_10px_24px_rgba(37,99,235,0.08)]"
                            : "border-transparent bg-white/75"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-900">{name}</span>
                          <span className="text-xs text-slate-400">{time}</span>
                        </div>
                        <p className="mt-2 truncate text-slate-500">{preview}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-b border-slate-200 bg-white px-6 py-5 lg:border-b-0 lg:border-r">
                  <div className="border-b border-slate-200 pb-5">
                    <p className="text-sm font-semibold text-slate-900">Alex Chen</p>
                    <p className="mt-1 text-sm text-slate-500">alex@example.com</p>
                  </div>

                  <div className="space-y-4 py-5">
                    <div className="max-w-[76%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-7 text-slate-700">
                      Quick question about pricing...
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-7 text-white">
                      Happy to help! What would you like to know?
                    </div>
                  </div>
                </div>

                <div className="bg-[#FCFDFE] px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      AC
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Alex Chen</p>
                      <p className="text-sm text-slate-500">alex@example.com</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current page</p>
                      <p className="mt-2 font-medium text-blue-600">/pricing</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Location</p>
                      <p className="mt-2 text-slate-700">San Francisco, CA</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Tags</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">lead</span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">pricing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid gap-14 px-2 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["AC", "Alex Chen", "San Francisco, CA", "/pricing"],
                  ["EW", "Emma Wilson", "London, UK", "/features"]
                ].map(([initials, name, location, page]) => (
                  <div key={name} className="hover-lift rounded-[26px] border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {initials}
                      </div>
                      <span className="text-xs font-medium text-emerald-600">● Online</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{name}</h3>
                    <p className="mt-3 text-sm text-slate-600">📍 {location}</p>
                    <p className="mt-2 text-sm font-medium text-blue-600">📄 {page}</p>
                    <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                      Start chat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <SectionLabel>Visitor Intelligence</SectionLabel>
              <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">See who&apos;s on your site right now</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Watch visitors browse in real-time. Spot high-intent prospects on your pricing page.
                Start conversations before they leave.
              </p>
              <ul className="mt-8 space-y-4 text-sm leading-7 text-slate-600">
                <li>Live visitor list with current page</li>
                <li>Location, browser, and time on site</li>
                <li>Conversation history at your fingertips</li>
                <li>Proactively reach out to hot leads</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 px-2 text-white sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label}>
                <div className="text-4xl font-semibold tracking-tight">{item.value}</div>
                <p className="mt-2 text-sm text-blue-100">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFFBF5]">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <section id="testimonials" className="px-2">
            <div className="max-w-4xl">
              <SectionLabel>Testimonials</SectionLabel>
              <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl lg:whitespace-nowrap">
                Teams who switched never looked back
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="hover-lift rounded-[28px] border border-slate-200/80 bg-white/90 p-7"
                >
                  <p className="text-base leading-8 text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {testimonial.initials}
                    </div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <section id="how-it-works" className="grid gap-14 px-2 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <SectionLabel>Getting Started</SectionLabel>
              <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">Live in 5 minutes. Seriously.</h2>

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
                Add our tiny script to your site. That&apos;s it. Works with any website, WordPress, Webflow,
                Shopify, custom code.
              </p>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <section id="pricing" className="px-2">
            <div className="max-w-3xl">
              <SectionLabel>Pricing</SectionLabel>
              <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">Simple pricing for small teams</h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">Start free. Upgrade when you&apos;re ready.</p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative flex min-h-[38rem] flex-col rounded-[28px] border bg-white p-10 ${
                    plan.featured
                      ? "border-2 border-blue-600 shadow-[0_18px_48px_rgba(37,99,235,0.08)]"
                      : "border-slate-200"
                  }`}
                >
                  {plan.featured ? (
                    <div className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                      Most Popular
                    </div>
                  ) : null}
                  <h3 className="text-[2rem] font-semibold tracking-tight text-slate-900">{plan.name}</h3>
                  <p className="mt-4 text-[15px] leading-7 text-slate-500">{plan.subtitle}</p>
                  <div className="mt-12 flex items-end gap-2">
                    <span className="display-font text-6xl leading-none text-slate-900 sm:text-7xl">
                      {plan.price}
                    </span>
                    {plan.cadence ? (
                      <span className="pb-2 text-[15px] font-medium text-slate-500">{plan.cadence}</span>
                    ) : null}
                  </div>
                  <ul className="mt-12 border-t border-slate-100">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 border-b border-slate-100 py-5 text-[15px] text-slate-700"
                      >
                        <CheckIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className={`mt-auto inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-semibold transition ${
                      plan.featured
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <LandingFinalCtaFooter />
    </>
  );
}
