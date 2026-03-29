import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getFreeToolBySlug, type FreeTool } from "@/lib/free-tools-data";
import { WelcomeMessageGeneratorPage } from "./welcome-message-generator-page";

function getRequiredTool(): FreeTool {
  const tool = getFreeToolBySlug("welcome-message-generator");

  if (!tool) {
    throw new Error("FREE_TOOL_NOT_FOUND:welcome-message-generator");
  }

  return tool;
}

const tool = getRequiredTool();

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: buildAbsoluteUrl(tool.href) }
};

export default function WelcomeMessageGeneratorRoute() {
  return <WelcomeMessageGeneratorPage tool={tool} />;
}
