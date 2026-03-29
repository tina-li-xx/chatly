import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getFreeToolBySlug, type FreeTool } from "@/lib/free-tools-data";
import { ResponseToneCheckerPage } from "./response-tone-checker-page";

function getRequiredTool(): FreeTool {
  const tool = getFreeToolBySlug("response-tone-checker");

  if (!tool) {
    throw new Error("FREE_TOOL_NOT_FOUND:response-tone-checker");
  }

  return tool;
}

const tool = getRequiredTool();

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: buildAbsoluteUrl(tool.href) }
};

export default function ResponseToneCheckerRoute() {
  return <ResponseToneCheckerPage tool={tool} />;
}
