import { buildFreeToolFaqSchema, buildFreeToolSchema } from "@/lib/free-tools-utils";
import type { FreeTool } from "@/lib/free-tools-data";
import { getRelatedFreeTools } from "@/lib/free-tools-data";
import { BlogShell } from "../../blog/blog-shell";
import { RoiCalculatorForm } from "./roi-calculator-form";
import {
  RoiCalculatorBreadcrumb,
  RoiCalculatorContextualCta,
  RoiCalculatorFaq,
  roiCalculatorFaqItems,
  RoiCalculatorHero,
  RoiCalculatorMethodology
} from "./roi-calculator-sections";
import { FreeToolMobileStickyCta, FreeToolRelated } from "../free-tool-page-shared";

export default function RoiCalculatorPage({ tool }: { tool: FreeTool }) {
  const toolSchema = buildFreeToolSchema(tool);
  const faqSchema = buildFreeToolFaqSchema(roiCalculatorFaqItems);

  return (
    <BlogShell>
      <main className="px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
          <RoiCalculatorBreadcrumb />
          <RoiCalculatorHero tool={tool} />

          <div className="mt-10">
            <RoiCalculatorForm />
          </div>

          <div className="mt-10">
            <RoiCalculatorContextualCta />
          </div>

          <div className="mt-12">
            <RoiCalculatorMethodology />
          </div>

          <div className="mt-12">
            <RoiCalculatorFaq />
          </div>

          <div className="mt-12">
            <FreeToolRelated tools={getRelatedFreeTools(tool.slug)} />
          </div>
        </div>
        <FreeToolMobileStickyCta />
      </main>
    </BlogShell>
  );
}
