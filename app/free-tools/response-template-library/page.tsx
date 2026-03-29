import type { Metadata } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getFreeToolBySlug, type FreeTool } from "@/lib/free-tools-data";
import { ResponseTemplateLibraryPage } from "./response-template-library-page";

function getRequiredTool(): FreeTool {
  const tool = getFreeToolBySlug("response-template-library");

  if (!tool) {
    throw new Error("FREE_TOOL_NOT_FOUND:response-template-library");
  }

  return tool;
}

const tool = getRequiredTool();

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: { canonical: buildAbsoluteUrl(tool.href) }
};

export default function ResponseTemplateLibraryRoute() {
  return <ResponseTemplateLibraryPage tool={tool} />;
}
