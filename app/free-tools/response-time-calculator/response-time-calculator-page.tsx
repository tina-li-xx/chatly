import { buildFreeToolFaqSchema, buildFreeToolSchema } from "@/lib/free-tools-utils";
import { getRelatedFreeTools, type FreeTool, type FreeToolFaqItem } from "@/lib/free-tools-data";
import { BlogShell } from "../../blog/blog-shell";
import {
  FreeToolBreadcrumb,
  FreeToolContextualCta,
  FreeToolFaq,
  FreeToolHero,
  FreeToolMobileStickyCta,
  FreeToolRelated
} from "../free-tool-page-shared";
import { ResponseTimeCalculatorForm } from "./response-time-calculator-form";

const faqItems: FreeToolFaqItem[] = [
  { question: "What is a good live chat response time?", answer: "For most small teams, under 15 minutes is strong and under 5 minutes is excellent." },
  { question: "Should I optimize for every hour of the day?", answer: "No. Start by covering your highest-intent windows, then tighten the rest later." },
  { question: "Why does response time affect conversion?", answer: "Because hesitation compounds fast. Slow replies leave room for doubt and drop-off." }
];

export function ResponseTimeCalculatorPage({ tool }: { tool: FreeTool }) {
  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolSchema(tool)) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolFaqSchema(faqItems)) }} />
          <FreeToolBreadcrumb title={tool.title} />
          <FreeToolHero tool={tool} subtitle="See how your average first response time stacks up and get a grade with clear ways to improve." />
          <div className="mt-10"><ResponseTimeCalculatorForm /></div>
          <div className="mt-10">
            <FreeToolContextualCta
              title="Chatting tracks response speed in real time for your whole team."
              body="See first-response time, coverage gaps, and teammate activity without digging through inbox threads or spreadsheets."
            />
          </div>
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
              <h2 className="display-font text-3xl text-slate-900">How the grade works</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">We compare your average first response time against practical small-team benchmarks for your industry, then translate the gap into a simple grade.</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
              <h2 className="display-font text-3xl text-slate-900">What to do with it</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Use the grade as a starting point, then tighten saved replies, notifications, and coverage windows until the response gap closes.</p>
            </div>
          </section>
          <div className="mt-12"><FreeToolFaq items={faqItems} /></div>
          <div className="mt-12"><FreeToolRelated tools={getRelatedFreeTools(tool.slug)} /></div>
        </div>
        <FreeToolMobileStickyCta />
      </main>
    </BlogShell>
  );
}
