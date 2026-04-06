import { ButtonLink } from "./components/ui/Button";
import { GrometricsButtonLink } from "./grometrics-button-link";
import {
  LandingHeroLogoStrip
} from "./landing-page-hero-visuals";

export function LandingTopSections() {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFBF5_0%,#FFFFFF_100%)]">
        <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_34%)]" />
        <div className="relative mx-auto w-full max-w-[1240px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <section className="grid gap-16 px-2 pb-20 pt-16 lg:grid-cols-[minmax(0,1fr)_396px] lg:items-center lg:pt-24">
            <div className="max-w-2xl">
              <h1 className="display-font text-5xl leading-[0.96] text-slate-900 sm:text-6xl lg:text-7xl">
                Every visitor you ignore
                <br />
                <span className="text-blue-600">is revenue you lose.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Chatting puts live chat on your site so you can answer questions, close deals, and stop losing
                customers to silence. Built for small teams. Priced like it.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <GrometricsButtonLink
                  href="/signup"
                  eventName="signup_started"
                  eventProperties={{ source: "landing_hero" }}
                  trailingIcon={<span aria-hidden="true">→</span>}
                >
                  Start 14 day free trial — live in 3 minutes
                </GrometricsButtonLink>
                <ButtonLink
                  href="#features"
                  variant="secondary"
                >
                  See it in action
                </ButtonLink>
              </div>

              <div className="mt-10">
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  2,400+ teams use Chatting to catch visitors before they bounce.
                </p>
                <LandingHeroLogoStrip />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[396px]">
              <div className="relative">
                <div className="absolute inset-x-10 top-0 h-24 rounded-b-full bg-blue-100/70 blur-3xl" />
                <div className="relative shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                  <div className="flex items-center justify-between rounded-t-[28px] bg-blue-600 px-5 py-4 text-white">
                    <div>
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true">👋</span>
                        <span className="text-sm font-semibold">Chatting Team</span>
                      </div>
                      <p className="mt-1 text-xs text-white/80">Online • Shared inbox live</p>
                    </div>
                    <div className="flex items-center gap-4 text-lg text-white/90">
                      <span aria-hidden="true">−</span>
                      <span aria-hidden="true">×</span>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-b-[28px] bg-[#FFFDF9]">
                    <div className="space-y-4 px-5 py-5">
                      <div className="message-enter max-w-[78%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
                        Hi! Quick question about your pricing page...
                        <div className="mt-2 text-[11px] text-slate-400">2:34 PM</div>
                      </div>
                      <div
                        className="message-enter ml-auto max-w-[82%] rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white"
                        style={{ animationDelay: "120ms" }}
                      >
                        Hey! Happy to help. What would you like to know? 😊
                        <div className="mt-2 text-[11px] text-blue-100">2:35 PM</div>
                      </div>
                      <div
                        className="message-enter max-w-[68%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-700"
                        style={{ animationDelay: "220ms" }}
                      >
                        Do you have a free trial?
                        <div className="mt-2 text-[11px] text-slate-400">2:36 PM</div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs text-slate-500">
                        <span className="typing-dot h-2 w-2 rounded-full bg-blue-600" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-blue-600" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-blue-600" />
                        Sarah is typing...
                      </div>
                    </div>
                    <div className="border-t border-slate-200 bg-white px-5 py-4">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
                        <span className="flex-1">Type a message...</span>
                        <span className="glow-send inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="px-2">
            <div className="grid gap-16 lg:grid-cols-[minmax(0,1.05fr)_320px] lg:items-start">
              <div className="max-w-3xl">
                <h2 className="display-font text-4xl leading-[1.02] text-slate-900 sm:text-5xl lg:text-6xl">
                  Your contact form is a conversion killer.
                </h2>

                <div className="mt-8 space-y-5">
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    Someone&apos;s on your pricing page right now. They have one question. One hesitation. One thing
                    standing between them and buying.
                  </p>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    But your &quot;contact us&quot; form? That&apos;s a 24-hour delay. By the time you reply, they&apos;ve
                    bought from the competitor who was actually there.
                  </p>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    You&apos;re not losing customers because your product is bad. You&apos;re losing them because
                    you&apos;re not in the room when they&apos;re ready to buy.
                  </p>
                  <p className="text-lg font-medium leading-8 text-slate-900">They don&apos;t wait. They leave.</p>
                </div>
              </div>

              <div className="lg:pt-12">
                <div className="h-1 w-28 rounded-full bg-blue-500" />
                <p className="mt-8 text-6xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-7xl">67%</p>
                <p className="mt-6 max-w-[260px] text-2xl font-semibold leading-10 text-slate-900">
                  of visitors leave without buying when they can&apos;t get instant answers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl px-2 text-center">
            <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">
              Answer questions before they leave.
            </h2>
            <div className="mx-auto mt-5 max-w-3xl space-y-4 text-lg leading-8 text-slate-600">
              <p>
                Chatting is live chat that helps small teams convert more visitors into paying customers. See who&apos;s
                on your site, answer their questions in real-time.
              </p>
              <p>
                Not a bloated &quot;customer platform.&quot; Not enterprise software with enterprise pricing. Just the
                tool you need to turn traffic into revenue.
              </p>
              <p className="font-medium text-slate-900">
                The difference between a visitor and a customer is often one answer.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
