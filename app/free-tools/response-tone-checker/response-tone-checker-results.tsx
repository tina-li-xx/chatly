"use client";

import { useState } from "react";
import { FormButton } from "../../ui/form-controls";
import { FreeToolExportGate } from "../free-tool-export-gate";
import type { ResponseToneAnalysis, ResponseToneDimensionKey } from "@/lib/response-tone-checker";

const dimensionLabels: Record<ResponseToneDimensionKey, string> = {
  friendliness: "Friendliness",
  professionalism: "Professionalism",
  empathy: "Empathy",
  clarity: "Clarity",
  helpfulness: "Helpfulness"
};

function barClass(score: number) {
  return score >= 9 ? "bg-emerald-500" : score >= 7 ? "bg-blue-600" : score >= 5 ? "bg-amber-500" : "bg-rose-500";
}

function labelClass(label: ResponseToneAnalysis["overall_label"]) {
  return label === "Excellent"
    ? "bg-emerald-50 text-emerald-700"
    : label === "Good"
      ? "bg-blue-50 text-blue-700"
      : label === "Needs Work"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";
}

export function ResponseToneCheckerResults({
  analysis,
  contextLabel,
  message
}: {
  analysis: ResponseToneAnalysis;
  contextLabel: string;
  message: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <div className={`rounded-[18px] px-5 py-6 text-center ${labelClass(analysis.overall_label)}`}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em]">Overall score</p>
          <div className="mt-3 text-7xl font-bold leading-none">{analysis.overall_score}</div>
          <p className="mt-3 text-lg font-medium text-slate-700">{analysis.overall_label}</p>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Dimension breakdown</p>
          <div className="mt-4 space-y-4">
            {(Object.keys(dimensionLabels) as ResponseToneDimensionKey[]).map((key) => {
              const item = analysis.dimensions[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                    <span>{dimensionLabels[key]}</span>
                    <span>{item.score}/10</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${barClass(item.score)}`} style={{ width: `${item.score * 10}%` }} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Issues found</p>
        <div className="mt-4 space-y-4">
          {analysis.issues.length ? analysis.issues.map((issue) => (
            <article key={`${issue.text}-${issue.suggestion}`} className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">&quot;{issue.text}&quot;</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Issue: {issue.issue}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Try: {issue.suggestion}</p>
            </article>
          )) : <p className="text-sm leading-6 text-slate-600">No obvious phrasing issues were flagged in this draft.</p>}
        </div>
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Strengths</p>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {analysis.strengths.map((item) => <li key={item}>✓ {item}</li>)}
        </ul>
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Rewritten version</p>
            <p className="mt-1 text-sm text-slate-500">Chatting&apos;s saved replies help you nail the tone every time.</p>
          </div>
          <FormButton type="button" variant="secondary" size="md" onClick={async () => { await navigator.clipboard.writeText(analysis.rewritten); setCopied(true); }}>
            {copied ? "Copied" : "Copy"}
          </FormButton>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-700">{analysis.rewritten}</p>
      </div>

      <FreeToolExportGate
        toolSlug="response-tone-checker"
        source="free-tools-response-tone"
        resultPayload={{ contextLabel, message, analysis }}
        title="Get a report of this analysis"
        buttonLabel="Send my analysis"
      />
    </div>
  );
}
