import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { CHANGELOG_ENTRIES } from "@/lib/changelog-data";
import { LandingFinalCtaFooter } from "../landing-page-final-cta-footer";
import { LandingHeader } from "../landing-page-primitives";

export const metadata: Metadata = {
  title: "Chatting Changelog",
  description:
    "See the latest product updates, email improvements, reporting changes, and workflow polish shipping in Chatting.",
  alternates: {
    canonical: buildAbsoluteUrl("/changelog")
  }
};

export default function ChangelogPage() {
  return (
    <main className="bg-white text-slate-900">
      <LandingHeader />

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_100%)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Changelog</p>
          <h1 className="display-font mt-4 max-w-4xl text-5xl leading-[1.04] text-slate-900 sm:text-6xl">
            Product updates for warmer, faster customer conversations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A running log of the product, email, and workflow improvements shipping in Chatting.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {CHANGELOG_ENTRIES.map((entry) => (
            <article
              key={`${entry.period}-${entry.title}`}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-8"
            >
              <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    {entry.period}
                  </p>
                </div>

                <div>
                  <h2 className="display-font text-3xl leading-tight text-slate-900">
                    {entry.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                    {entry.summary}
                  </p>
                  <ul className="mt-6 space-y-3 text-base leading-7 text-slate-700">
                    {entry.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-[11px] h-2 w-2 rounded-full bg-blue-600" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <LandingFinalCtaFooter />
    </main>
  );
}
