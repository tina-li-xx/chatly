"use client";

import { useState } from "react";
import { FormButton, FormInput, FormSelect } from "../../ui/form-controls";
import { calculateResponseTimeGrade, type ResponseTimeIndustry } from "@/lib/response-time-tool";
import {
  FreeToolBenchmarkBar,
  FreeToolEmptyResults,
  FreeToolGradeCard,
  FreeToolMetricCard
} from "../free-tool-page-shared";
import { FreeToolExportGate } from "../free-tool-export-gate";

const industries: Array<{ value: ResponseTimeIndustry; label: string }> = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "services", label: "Services" },
  { value: "agency", label: "Agency" }
];

export function ResponseTimeCalculatorForm() {
  const [industry, setIndustry] = useState<ResponseTimeIndustry>("ecommerce");
  const [responseTime, setResponseTime] = useState("45");
  const [teamSize, setTeamSize] = useState("3");
  const [result, setResult] = useState<ReturnType<typeof calculateResponseTimeGrade> | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(calculateResponseTimeGrade(industry, Number(responseTime) || 0, Number(teamSize) || 1));
  }

  return (
    <form className="grid gap-8 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]" onSubmit={handleSubmit}>
      <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Industry</span>
          <FormSelect value={industry} onChange={(event) => setIndustry(event.target.value as ResponseTimeIndustry)}>
            {industries.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </FormSelect>
        </label>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Average response time</span>
          <FormInput type="number" min="0" value={responseTime} onChange={(event) => setResponseTime(event.target.value)} />
          <span className="mt-2 block text-sm text-slate-500">In minutes</span>
        </label>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Team size</span>
          <FormInput type="number" min="1" value={teamSize} onChange={(event) => setTeamSize(event.target.value)} />
          <span className="mt-2 block text-sm text-slate-500">How many people actively cover chat?</span>
        </label>
        <FormButton type="submit" className="mt-8 w-full">Calculate</FormButton>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-8">
        {!result ? (
          <FreeToolEmptyResults
            title="Enter your numbers to see how you compare"
            body="We’ll grade your response time, compare it with practical benchmarks, and show the fastest path to improve."
          />
        ) : (
          <div className="space-y-5">
            <FreeToolGradeCard grade={result.grade} descriptor={result.summary} />
            <div className="grid gap-4 sm:grid-cols-3">
              <FreeToolMetricCard label="Your time" value={`${result.responseTimeMinutes} min`} />
              <FreeToolMetricCard label="Industry average" value={`${result.averageBenchmark} min`} />
              <FreeToolMetricCard label="Top performers" value={`${result.topPerformerBenchmark} min`} />
            </div>
            <FreeToolBenchmarkBar
              average={result.averageBenchmark}
              top={result.topPerformerBenchmark}
              current={result.responseTimeMinutes}
            />
            <div className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Tips to improve</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                {result.tips.map((tip) => <li key={tip}>✓ {tip}</li>)}
              </ul>
            </div>
            <FreeToolExportGate
              toolSlug="response-time-calculator"
              source="free-tools-response-time"
              resultPayload={{
                industryLabel: industries.find((option) => option.value === industry)?.label ?? industry,
                result
              }}
              title="Send this response-time report to your inbox"
            />
          </div>
        )}
      </section>
    </form>
  );
}
