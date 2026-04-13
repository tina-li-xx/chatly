import "server-only";

import { getChattingSeoAnalysis } from "@/lib/chatting-seo-analysis";
import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { listDashboardPublishingPlanRunEntries } from "@/lib/data/dashboard-publishing-plan-run-entries";
import { countRemainingPlannedItems, readDashboardPublishingPlanRunRole } from "@/lib/dashboard-publishing-plan-run-state";
import { listSeoGeneratedDraftRows } from "@/lib/repositories/seo-generated-drafts-repository";
import { isReviewGeneratedDraftRow, resolveGeneratedDraftPublicationStatus, resolveGeneratedDraftWorkflowStatus } from "@/lib/seo-generated-blog-posts";

type DashboardPublishingPlanRunSnapshot = {
  id: string;
  role: "current" | "upcoming" | "historical";
  status: string;
  generatedAt: string | null; updatedAt: string;
  itemCount: number; remainingItemCount: number;
  summary: string | null; analysisSource: string | null; researchSource: string | null;
  items: Array<{
    id: string;
    position: number;
    title: string; targetKeyword: string; status: string;
    searchIntent: string; categorySlug: string; ctaId: string;
    priorityScore: number; rationale: string;
    targetPublishAt: string | null;
  }>;
};

export type DashboardPublishingSeoSnapshot = {
  profile: {
    productName: string;
    canonicalUrl: string;
    seoTitle: string;
    seoDescription: string;
    pricingAnchor: string;
    positioning: string[];
    bestFit: string[];
    contentFit: string[];
    claimsDiscipline: string[];
    competitors: Array<{ slug: string; name: string; summary: string }>;
    themes: Array<{ slug: string; label: string }>;
    inventoryCounts: { guides: number; freeTools: number; categories: number; ctas: number };
    ctas: Array<{ id: string; label: string; href: string }>;
  };
  database: { status: "ready" | "unavailable"; message: string };
  analysis: Awaited<ReturnType<typeof getChattingSeoAnalysis>> | null;
  planRuns: DashboardPublishingPlanRunSnapshot[];
  drafts: Array<{
    id: string; title: string; slug: string;
    status: string; publicationStatus: string; updatedAt: string;
    categorySlug: string;
  }>;
};

function buildProfile() {
  return {
    productName: chattingSeoProfile.productName,
    canonicalUrl: chattingSeoProfile.canonicalUrl,
    seoTitle: chattingSeoProfile.seo.siteTitle,
    seoDescription: chattingSeoProfile.seo.siteDescription,
    pricingAnchor: chattingSeoProfile.seo.pricingAnchor,
    positioning: chattingSeoProfile.messaging.positioning,
    bestFit: chattingSeoProfile.messaging.bestFit,
    contentFit: chattingSeoProfile.messaging.contentFit,
    claimsDiscipline: chattingSeoProfile.messaging.claimsDiscipline,
    competitors: chattingSeoProfile.messaging.competitiveFraming.map(({ slug, name, summary }) => ({ slug, name, summary })),
    themes: chattingSeoProfile.contentInventory.blogCategories.map(({ slug, label }) => ({ slug, label })),
    inventoryCounts: {
      guides: chattingSeoProfile.contentInventory.guides.length,
      freeTools: chattingSeoProfile.contentInventory.freeTools.length,
      categories: chattingSeoProfile.contentInventory.blogCategories.length,
      ctas: chattingSeoProfile.ctas.length
    },
    ctas: chattingSeoProfile.ctas
  };
}

function toRecord(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function summaryString(summary: unknown, key: string) {
  const candidate = toRecord(summary)[key];
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

function isAnalysisPlanSummary(summary: unknown) {
  const version = summaryString(summary, "planEngineVersion") ?? "";
  return /^keyword-analysis-v\d+$/.test(version) || /^keyword-corpus-v\d+$/.test(version);
}

function databaseMessage(latestRunSummary: unknown, planRunCount: number, draftCount: number) {
  if (!planRunCount && !draftCount) return "No SEO planning data yet.";
  if (isAnalysisPlanSummary(latestRunSummary)) {
    return summaryString(latestRunSummary, "researchSource") === "live"
      ? "30-day plan generated from the stored external keyword corpus."
      : "30-day plan generated from Chatting keyword analysis.";
  }

  return summaryString(latestRunSummary, "source") === "auto-bootstrap"
    ? "Starter plan generated automatically from the Chatting profile."
    : "Saved SEO planning data is available.";
}

function getDatabaseMessage(error: unknown) {
  if (!(error instanceof Error)) return "SEO planning data could not be loaded.";
  if (error.message.includes("relation") && error.message.includes("seo_")) {
    return "SEO planning tables are not available yet in this environment.";
  }
  return "SEO planning data could not be loaded.";
}

function toPlanRunSnapshot(input: {
  run: Awaited<ReturnType<typeof listDashboardPublishingPlanRunEntries>>[number]["run"];
  items: Awaited<ReturnType<typeof listDashboardPublishingPlanRunEntries>>[number]["items"];
}): DashboardPublishingPlanRunSnapshot {
  return {
    id: input.run.id,
    role: readDashboardPublishingPlanRunRole(input.run.summary_json) ?? "historical",
    status: input.run.status,
    generatedAt: input.run.generated_at,
    updatedAt: input.run.updated_at,
    itemCount: input.items.length,
    remainingItemCount: countRemainingPlannedItems(input.items),
    summary: summaryString(input.run.summary_json, "planSummary"),
    analysisSource: summaryString(input.run.summary_json, "analysisSource"),
    researchSource: summaryString(input.run.summary_json, "researchSource"),
    items: input.items.map((item) => ({
      id: item.id,
      position: item.position,
      title: item.title,
      targetKeyword: item.target_keyword,
      status: item.status,
      searchIntent: item.search_intent,
      categorySlug: item.category_slug,
      ctaId: item.cta_id,
      priorityScore: item.priority_score,
      rationale: item.rationale,
      targetPublishAt: item.target_publish_at
    }))
  };
}

function orderPlanRuns(runs: DashboardPublishingPlanRunSnapshot[]) {
  return [
    ...runs.filter((run) => run.role === "current"),
    ...runs.filter((run) => run.role === "upcoming"),
    ...runs.filter((run) => run.role === "historical")
  ];
}

export async function getDashboardPublishingSeoSnapshot(
  ownerUserId: string,
  options?: { includeAnalysis?: boolean }
): Promise<DashboardPublishingSeoSnapshot> {
  const profile = buildProfile();
  const analysis = options?.includeAnalysis ? await getChattingSeoAnalysis({ ownerUserId }).catch(() => null) : null;

  try {
    const planRunEntries = await listDashboardPublishingPlanRunEntries(ownerUserId, 3);
    const drafts = (await listSeoGeneratedDraftRows(ownerUserId, 100)).filter((draft) => isReviewGeneratedDraftRow(draft));
    const runSummaries = planRunEntries.map(toPlanRunSnapshot);
    const currentRunSummary = planRunEntries.find(({ run }) => readDashboardPublishingPlanRunRole(run.summary_json) === "current")?.run.summary_json;

    return {
      profile,
      database: {
        status: "ready",
        message: databaseMessage(currentRunSummary ?? planRunEntries[0]?.run.summary_json, runSummaries.length, drafts.length)
      },
      analysis,
      planRuns: orderPlanRuns(runSummaries),
      drafts: drafts.map((draft) => ({
        id: draft.id,
        title: draft.title,
        slug: draft.slug,
        status: resolveGeneratedDraftWorkflowStatus(draft),
        publicationStatus: resolveGeneratedDraftPublicationStatus(draft) || draft.publication_status,
        updatedAt: draft.updated_at,
        categorySlug: draft.category_slug
      })).slice(0, 5)
    };
  } catch (error) {
    return {
      profile,
      database: {
        status: "unavailable",
        message: getDatabaseMessage(error)
      },
      analysis,
      planRuns: [],
      drafts: []
    };
  }
}
