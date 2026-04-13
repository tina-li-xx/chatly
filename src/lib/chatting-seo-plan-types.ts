import type { ReplaceSeoPlanItemInput } from "@/lib/repositories/seo-pipeline-repository-shared";
import type { ChattingSeoAnalysis } from "@/lib/chatting-seo-analysis-types";

export type ChattingSeoGeneratedPlan = {
  source: "ai" | "fallback";
  generatedAt: string;
  summary: string;
  analysis: ChattingSeoAnalysis;
  items: ReplaceSeoPlanItemInput[];
};
