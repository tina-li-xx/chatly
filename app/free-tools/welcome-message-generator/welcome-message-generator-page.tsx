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
import { WelcomeMessageGeneratorForm } from "./welcome-message-generator-form";

const faqItems: FreeToolFaqItem[] = [
  { question: "What makes a good welcome message?", answer: "It should be short, warm, and tied to what the visitor is likely trying to do right now." },
  { question: "Should I use proactive welcome messages on every page?", answer: "No. Match the message to high-intent pages like pricing, checkout, or product detail views." },
  { question: "How long should a greeting be?", answer: "Usually one sentence is enough. The goal is to invite a reply, not deliver a speech." }
];

export function WelcomeMessageGeneratorPage({ tool }: { tool: FreeTool }) {
  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolSchema(tool)) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolFaqSchema(faqItems)) }} />
          <FreeToolBreadcrumb title={tool.title} />
          <FreeToolHero tool={tool} subtitle="Generate warm, usable greetings for pricing pages, product pages, support chats, and checkout hesitation." />
          <div className="mt-10"><WelcomeMessageGeneratorForm /></div>
          <div className="mt-10">
            <FreeToolContextualCta
              title="Chatting can show the right welcome message on the right page automatically."
              body="Use page rules and timing triggers so your greeting feels relevant instead of intrusive."
            />
          </div>
          <section className="mt-12 rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
            <h2 className="display-font text-3xl text-slate-900">How to use it well</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Start with the generated message, then tailor it to the page and the friction point. Pricing visitors need clarity, checkout visitors need reassurance, and support visitors need calm.</p>
          </section>
          <div className="mt-12"><FreeToolFaq items={faqItems} /></div>
          <div className="mt-12"><FreeToolRelated tools={getRelatedFreeTools(tool.slug)} /></div>
        </div>
        <FreeToolMobileStickyCta />
      </main>
    </BlogShell>
  );
}
