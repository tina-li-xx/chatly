import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

export type ChattingMarketingCompetitor = {
  slug: string;
  name: string;
  summary: string;
  points: string[];
};

export type ChattingMarketingContext = {
  sourcePath: string;
  auditPath: string;
  positioning: string[];
  coreStory: string[];
  founderApprovedClaims: string[];
  verifiedProductCoverage: string[];
  bestFit: string[];
  notFit: string[];
  competitiveFraming: ChattingMarketingCompetitor[];
  tone: string[];
  prefer: string[];
  avoid: string[];
  contentFit: string[];
  contentMisfit: string[];
  claimsDiscipline: string[];
};

const sourcePath = path.join(process.cwd(), "digital_marketing", "chatting-product-context.md");
const auditPath = path.join(process.cwd(), "digital_marketing", "chatting-product-context-audit.md");
const markdown = readFileSync(sourcePath, "utf8");

function readStructuredBlock() {
  const match = markdown.match(
    /<!-- marketing-context-json:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- marketing-context-json:end -->/
  );

  if (!match?.[1]) {
    throw new Error("CHATTING_MARKETING_CONTEXT_JSON_MISSING");
  }

  try {
    return JSON.parse(match[1]) as Omit<ChattingMarketingContext, "sourcePath" | "auditPath">;
  } catch {
    throw new Error("CHATTING_MARKETING_CONTEXT_JSON_INVALID");
  }
}

const structuredContext = readStructuredBlock();

export const chattingMarketingContext: ChattingMarketingContext = {
  sourcePath,
  auditPath,
  ...structuredContext
};
