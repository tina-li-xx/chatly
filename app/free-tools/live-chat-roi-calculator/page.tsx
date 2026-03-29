import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getFreeToolBySlug, type FreeTool } from "@/lib/free-tools-data";
import RoiCalculatorPage from "./roi-calculator-page";

function getRequiredTool(): FreeTool {
  const tool = getFreeToolBySlug("live-chat-roi-calculator");

  if (!tool) {
    throw new Error("FREE_TOOL_NOT_FOUND:live-chat-roi-calculator");
  }

  return tool;
}

const tool = getRequiredTool();

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: buildAbsoluteUrl(tool.href) }
};

export default function LiveChatRoiCalculatorRoute() {
  return <RoiCalculatorPage tool={tool} />;
}
