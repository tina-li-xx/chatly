type PublishingAnalysisDescriptor = {
  analysisSource: string | null;
  researchSource: string | null;
};

export function formatPublishingAnalysisLabel({
  analysisSource,
  researchSource
}: PublishingAnalysisDescriptor) {
  if (researchSource === "live") {
    return analysisSource === "ai" ? "keyword-corpus-backed AI" : "keyword-corpus-backed fallback";
  }

  return analysisSource === "ai" ? "AI-backed" : "source-backed fallback";
}
