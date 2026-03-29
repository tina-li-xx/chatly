import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getFreeToolBySlug, type FreeTool } from "@/lib/free-tools-data";
import { ResponseTimeCalculatorPage } from "./response-time-calculator-page";

function getRequiredTool(): FreeTool {
  const tool = getFreeToolBySlug("response-time-calculator");

  if (!tool) {
    throw new Error("FREE_TOOL_NOT_FOUND:response-time-calculator");
  }

  return tool;
}

const tool = getRequiredTool();

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: buildAbsoluteUrl(tool.href) }
};

export default function ResponseTimeCalculatorRoute() {
  return <ResponseTimeCalculatorPage tool={tool} />;
}
