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
import { ResponseTemplateLibraryTool } from "./response-template-library-tool";

const faqItems: FreeToolFaqItem[] = [
  { question: "Should I use canned responses word for word?", answer: "Use them as a head start, then personalize them with the customer's context before you send." },
  { question: "What templates matter most first?", answer: "Start with greetings, apologies, handoffs, and follow-ups because they show up constantly." },
  { question: "How many templates should a small team keep?", answer: "Usually 10-20 core templates covers most repetitive live chat moments without becoming unmanageable." }
];

export function ResponseTemplateLibraryPage({ tool }: { tool: FreeTool }) {
  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolSchema(tool)) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolFaqSchema(faqItems)) }} />
          <FreeToolBreadcrumb title={tool.title} />
          <FreeToolHero tool={tool} subtitle="Search reusable replies for greetings, apologies, handoffs, and follow-ups, then adapt them to your team voice." />
          <div className="mt-10"><ResponseTemplateLibraryTool /></div>
          <div className="mt-10">
            <FreeToolContextualCta
              title="Store your best replies inside Chatting instead of pasting from scattered docs."
              body="Saved replies, team collaboration, and shared inbox context make templates useful in the moment, not just in a library."
            />
          </div>
          <div className="mt-12"><FreeToolFaq items={faqItems} /></div>
          <div className="mt-12"><FreeToolRelated tools={getRelatedFreeTools(tool.slug)} /></div>
        </div>
        <FreeToolMobileStickyCta />
      </main>
    </BlogShell>
  );
}
