import Link from "next/link";
import { CHATTING_PAID_PLANS_COPY } from "@/lib/pricing";
import type { FreeTool, FreeToolFaqItem } from "@/lib/free-tools-data";

export const roiCalculatorFaqItems: FreeToolFaqItem[] = [
  {
    question: "Is 20% a realistic conversion increase?",
    answer:
      "It's conservative. Studies show 10-30% improvements, and some businesses see larger gains when live chat removes buyer hesitation."
  },
  {
    question: "What if I don't have 10,000 visitors?",
    answer:
      "The math still works at smaller volumes. Fewer visitors just means each saved conversion matters even more."
  },
  {
    question: "What if I can't answer chats all day?",
    answer:
      "Set business hours and use offline capture. Even part-time availability can outperform a slow contact form."
  },
  {
    question: "How long until I see results?",
    answer:
      "Usually within the first week. Unlike SEO or ad experiments, live chat changes the buyer experience immediately."
  }
];

export function RoiCalculatorBreadcrumb() {
  return (
    <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
      <Link href="/free-tools" className="font-medium text-slate-700 transition hover:text-slate-900">
        Free Tools
      </Link>
      <span>/</span>
      <span>Live Chat ROI Calculator</span>
    </nav>
  );
}

export function RoiCalculatorHero({ tool }: { tool: FreeTool }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-8 py-10 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-blue-50 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">
        ROI
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">{tool.kind}</p>
      <h1 className="display-font mt-3 text-4xl leading-tight text-slate-900 sm:text-5xl">{tool.title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        Calculate how much revenue live chat could add to your business and see how quickly the investment pays for itself.
      </p>
    </section>
  );
}

export function RoiCalculatorContextualCta() {
  return (
    <section className="rounded-[18px] border border-blue-100 border-l-4 border-l-blue-600 bg-blue-50 px-6 py-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Want to track this automatically?</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">Chatting turns this spreadsheet math into a live dashboard.</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
        Track response speed, team activity, and conversation volume in one place so you can improve the numbers behind this calculator without manual reporting.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Try Chatting free
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function RoiCalculatorMethodology() {
  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
        <h2 className="display-font text-3xl text-slate-900">How we calculate your ROI</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          We apply a conservative 20% lift to your current conversion rate, then compare the extra revenue against Chatting&apos;s pricing once you move past free: {CHATTING_PAID_PLANS_COPY}.
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>E-commerce average conversion: 2-3%</li>
          <li>E-commerce with chat: 3-4%</li>
          <li>B2B sites often see stronger qualification lift when response speed improves</li>
        </ul>
      </div>
      <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
        <h2 className="display-font text-3xl text-slate-900">Why live chat lifts conversion</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
          <li>Answer questions while buying intent is still high.</li>
          <li>Reduce hesitation on pricing, shipping, and fit before visitors bounce.</li>
          <li>Build trust by showing a real team is available to help.</li>
          <li>Recover would-be lost revenue without adding more ad spend.</li>
        </ul>
      </div>
    </section>
  );
}

export function RoiCalculatorFaq() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
      <h2 className="display-font text-3xl text-slate-900">FAQ</h2>
      <div className="mt-6 space-y-5">
        {roiCalculatorFaqItems.map((item) => (
          <div key={item.question} className="rounded-[18px] border border-slate-200 bg-slate-50 px-5 py-5">
            <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
