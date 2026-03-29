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
import { ResponseToneCheckerTool } from "./response-tone-checker-tool";

const faqItems: FreeToolFaqItem[] = [
  { question: "What does this checker score?", answer: "It scores friendliness, professionalism, empathy, clarity, and helpfulness, then suggests concrete fixes and a rewritten reply." },
  { question: "Can a message be too polished?", answer: "Yes. Overly polished replies can feel distant if they avoid plain language and direct help." },
  { question: "Should every support reply sound casual?", answer: "No. The goal is clear and warm, not forced casualness." }
];

export function ResponseToneCheckerPage({ tool }: { tool: FreeTool }) {
  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolSchema(tool)) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFreeToolFaqSchema(faqItems)) }} />
          <FreeToolBreadcrumb title={tool.title} />
          <FreeToolHero tool={tool} subtitle="Paste a reply before you send it and check whether it sounds warm, clear, and useful instead of robotic." />
          <div className="mt-10"><ResponseToneCheckerTool /></div>
          <div className="mt-10">
            <FreeToolContextualCta
              title="Chatting helps teams write faster without sounding scripted."
              body="Use saved replies as a base, then adapt them with context, teammate notes, and live conversation detail."
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
