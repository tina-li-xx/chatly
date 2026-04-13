import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { buildChattingSeoBaseAnalysisInput } from "@/lib/chatting-seo-analysis-input";
import { buildChattingSeoKeywordCorpusRefresh } from "@/lib/chatting-seo-keyword-corpus-refresh";
import { mapStoredKeywordResearch } from "@/lib/chatting-seo-keyword-corpus-mappers";
import type { ChattingSeoStoredKeywordResearch } from "@/lib/chatting-seo-keyword-corpus-types";
import { getChattingSeoLiveResearch } from "@/lib/chatting-seo-live-research";
import { contentPatternForResult, matchesChatting, matchesCompetitor } from "@/lib/chatting-seo-serp-matching";
import { withPostgresAdvisoryLock } from "@/lib/postgres-advisory-lock";
import { markSeoKeywordCorpusCycleMisses } from "@/lib/repositories/seo-keyword-corpus-cycle-repository";
import { listSeoKeywordCorpusRows, upsertSeoKeywordCorpusRows } from "@/lib/repositories/seo-keyword-corpus-repository";
import { listSeoKeywordResearchRunRows, insertSeoKeywordResearchRunRow, updateSeoKeywordResearchRunStatus } from "@/lib/repositories/seo-keyword-research-runs-repository";
import { insertSeoKeywordSerpSnapshotRows } from "@/lib/repositories/seo-keyword-serp-snapshots-repository";

const RESEARCH_ENGINE_VERSION = "external-keyword-corpus-v2";
const MINIMUM_STORED_KEYWORDS = 18;
const RESEARCH_FRESHNESS_HOURS = 12;

function lockKey(ownerUserId: string) {
  const digest = createHash("sha256").update(ownerUserId).digest();
  return [20260413, digest.readInt32BE(4)] as const;
}

function storedVersion(summary: unknown) {
  return summary && typeof summary === "object" && "researchEngineVersion" in summary
    ? String((summary as { researchEngineVersion?: string }).researchEngineVersion ?? "")
    : "";
}

function runIsFresh(generatedAt: string | null) {
  if (!generatedAt) return false;
  return Date.now() - new Date(generatedAt).getTime() <= RESEARCH_FRESHNESS_HOURS * 60 * 60 * 1000;
}

async function loadStoredKeywordResearch(ownerUserId: string) {
  const [run] = await listSeoKeywordResearchRunRows(ownerUserId, 1);
  const rows = await listSeoKeywordCorpusRows(ownerUserId, 40);
  return { run: run ?? null, rows };
}

function storedResearchUsable(input: Awaited<ReturnType<typeof loadStoredKeywordResearch>>) {
  return Boolean(
    input.rows.length >= MINIMUM_STORED_KEYWORDS &&
      input.run &&
      input.run.status === "ready" &&
      storedVersion(input.run.summary_json) === RESEARCH_ENGINE_VERSION &&
      runIsFresh(input.run.generated_at)
  );
}

async function refreshStoredKeywordResearch(input: {
  ownerUserId: string;
  actorUserId?: string | null;
}): Promise<ChattingSeoStoredKeywordResearch> {
  const runId = `seo_keyword_run_${randomUUID()}`;
  await insertSeoKeywordResearchRunRow({
    id: runId,
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId ?? null,
    sourceProfileSlug: "chatting-historical-keyword-corpus",
    status: "generating",
    providerChain: "",
    seedQueriesJson: [],
    summaryJson: { researchEngineVersion: RESEARCH_ENGINE_VERSION, source: "external-keyword-corpus" }
  });

  try {
    const existingRows = await listSeoKeywordCorpusRows(input.ownerUserId, 80);
    const refresh = await buildChattingSeoKeywordCorpusRefresh(existingRows);
    const generatedAt = refresh.capturedAt;

    if (!refresh.items.length) {
      throw new Error("CHATTING_SEO_KEYWORD_RESEARCH_UNAVAILABLE");
    }

    const upserted = await upsertSeoKeywordCorpusRows({
      ownerUserId: input.ownerUserId,
      items: refresh.items.map((item) => ({
        ...item,
        latestRunId: runId
      }))
    });
    const upsertedByKeyword = new Map(upserted.map((row) => [row.normalized_keyword, row]));

    await insertSeoKeywordSerpSnapshotRows({
      ownerUserId: input.ownerUserId,
      items: [...refresh.responseMap.entries()].flatMap(([normalizedKeyword, response]) => {
        const row = upsertedByKeyword.get(normalizedKeyword) ?? refresh.existingByKeyword.get(normalizedKeyword);
        return response.results.map((result) => ({
          id: `seo_keyword_snapshot_${randomUUID()}`,
          runId,
          keywordCorpusId: row?.id ?? null,
          normalizedKeyword,
          sourceQuery: normalizedKeyword,
          provider: response.provider,
          rank: result.rank,
          resultUrl: result.url,
          resultDomain: result.domain,
          resultTitle: result.title,
          resultSnippet: result.snippet,
          matchedCompetitorSlug:
            refresh.competitors.find((competitor) => matchesCompetitor(result, competitor.slug, competitor.name))?.slug ?? "",
          isChatting: matchesChatting(result),
          contentPattern: contentPatternForResult(result),
          capturedAt: generatedAt
        }));
      })
    });
    await markSeoKeywordCorpusCycleMisses({
      ownerUserId: input.ownerUserId,
      runId,
      seenNormalizedKeywords: refresh.items.map((item) => item.normalizedKeyword)
    });

    const run = await updateSeoKeywordResearchRunStatus({
      id: runId,
      ownerUserId: input.ownerUserId,
      status: "ready",
      providerChain: refresh.providers.join(","),
      seedQueriesJson: refresh.discoveryQueries,
      harvestedKeywordCount: refresh.items.length,
      generatedAt,
      summaryJson: {
        researchEngineVersion: RESEARCH_ENGINE_VERSION,
        source: "external-keyword-corpus",
        summary: `Historical keyword corpus refreshed from ${refresh.providers.join(" + ")} across ${refresh.discoveryQueries.length} discovery queries and ${refresh.responseMap.size} tracked SERP snapshots.`,
        providers: refresh.providers,
        discoveryQueryCount: refresh.discoveryQueries.length,
        trackedKeywordCount: refresh.responseMap.size
      }
    });

    return mapStoredKeywordResearch(run, await listSeoKeywordCorpusRows(input.ownerUserId, 40));
  } catch (error) {
    await updateSeoKeywordResearchRunStatus({
      id: runId,
      ownerUserId: input.ownerUserId,
      status: "failed",
      providerChain: "",
      seedQueriesJson: [],
      summaryJson: { researchEngineVersion: RESEARCH_ENGINE_VERSION, source: "external-keyword-corpus", error: error instanceof Error ? error.message : "refresh-failed" }
    });
    throw error;
  }
}

export async function getChattingSeoStoredKeywordResearch(input?: {
  ownerUserId?: string;
  actorUserId?: string | null;
}): Promise<ChattingSeoStoredKeywordResearch> {
  const baseInput = buildChattingSeoBaseAnalysisInput();
  if (!input?.ownerUserId) {
    const liveResearch = await getChattingSeoLiveResearch(baseInput).catch(() => null);
    return { candidates: baseInput.candidates, liveResearch, keywordCount: baseInput.candidates.length, runId: null };
  }

  try {
    const existing = await loadStoredKeywordResearch(input.ownerUserId);
    if (storedResearchUsable(existing)) {
      return mapStoredKeywordResearch(existing.run, existing.rows);
    }

    const lock = await withPostgresAdvisoryLock(lockKey(input.ownerUserId), async () =>
      refreshStoredKeywordResearch({ ownerUserId: input.ownerUserId!, actorUserId: input.actorUserId ?? null })
    );

    if (lock.value) {
      return lock.value;
    }

    const reloaded = await loadStoredKeywordResearch(input.ownerUserId);
    if (reloaded.rows.length) {
      return mapStoredKeywordResearch(reloaded.run, reloaded.rows);
    }
  } catch {}

  const liveResearch = await getChattingSeoLiveResearch(baseInput).catch(() => null);
  return { candidates: baseInput.candidates, liveResearch, keywordCount: baseInput.candidates.length, runId: null };
}
