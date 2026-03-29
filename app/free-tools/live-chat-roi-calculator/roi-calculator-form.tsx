"use client";

import { useState } from "react";
import { FormButton, FormInput } from "../../ui/form-controls";
import {
  DEFAULT_LIVE_CHAT_ROI_INPUTS,
  calculateLiveChatRoi,
  formatPercentage,
  formatWholeCurrency,
  formatWholeNumber,
  type LiveChatRoiResult
} from "@/lib/live-chat-roi";
import {
  FreeToolEmptyResults,
  FreeToolMetricCard
} from "../free-tool-page-shared";
import { FreeToolExportGate } from "../free-tool-export-gate";

function toNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function CalculatedResults({ result, exportPayload }: { result: LiveChatRoiResult; exportPayload: Record<string, unknown> }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[18px] bg-blue-600 px-5 py-5 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-100">With live chat</p>
        <div className="mt-3 text-5xl font-bold">{formatWholeCurrency(result.annualRevenueLift)}</div>
        <p className="mt-2 text-sm leading-6 text-blue-50">Additional annual revenue based on a conservative 20% lift in conversion rate.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FreeToolMetricCard label="Monthly lift" value={formatWholeCurrency(result.monthlyRevenueLift)} />
        <FreeToolMetricCard label="New conversion rate" value={formatPercentage(result.newConversionRate)} />
        <FreeToolMetricCard label="ROI" value={`${formatWholeNumber(result.roiPercent)}%`} />
        <FreeToolMetricCard label="Payback" value={result.paybackDays < 1 ? "<1 day" : `${formatWholeNumber(result.paybackDays)} days`} />
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Calculation breakdown</p>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
          <li>Current monthly conversions: {formatWholeNumber(result.currentConversions)}</li>
          <li>Current monthly revenue: {formatWholeCurrency(result.currentRevenue)}</li>
          <li>Projected monthly conversions: {formatWholeNumber(result.newConversions)}</li>
          <li>Projected monthly revenue: {formatWholeCurrency(result.newRevenue)}</li>
          <li>Annual Chatting cost: {formatWholeCurrency(result.annualCost)}</li>
        </ul>
      </div>

      <FreeToolExportGate
        toolSlug="live-chat-roi-calculator"
        source="free-tools-live-chat-roi"
        resultPayload={exportPayload}
        title="Send this ROI report to your inbox"
      />
    </div>
  );
}

export function RoiCalculatorForm() {
  const [monthlyVisitors, setMonthlyVisitors] = useState(String(DEFAULT_LIVE_CHAT_ROI_INPUTS.monthlyVisitors));
  const [conversionRate, setConversionRate] = useState(String(DEFAULT_LIVE_CHAT_ROI_INPUTS.conversionRate));
  const [averageOrderValue, setAverageOrderValue] = useState(String(DEFAULT_LIVE_CHAT_ROI_INPUTS.averageOrderValue));
  const [result, setResult] = useState<LiveChatRoiResult | null>(null);

  function handleCalculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(
      calculateLiveChatRoi({
        monthlyVisitors: toNumber(monthlyVisitors, DEFAULT_LIVE_CHAT_ROI_INPUTS.monthlyVisitors),
        conversionRate: toNumber(conversionRate, DEFAULT_LIVE_CHAT_ROI_INPUTS.conversionRate),
        averageOrderValue: toNumber(averageOrderValue, DEFAULT_LIVE_CHAT_ROI_INPUTS.averageOrderValue)
      })
    );
  }

  const exportPayload = {
    monthlyVisitors: toNumber(monthlyVisitors, DEFAULT_LIVE_CHAT_ROI_INPUTS.monthlyVisitors),
    conversionRate: toNumber(conversionRate, DEFAULT_LIVE_CHAT_ROI_INPUTS.conversionRate),
    averageOrderValue: toNumber(averageOrderValue, DEFAULT_LIVE_CHAT_ROI_INPUTS.averageOrderValue),
    result
  };

  return (
    <form className="grid gap-8 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]" onSubmit={handleCalculate}>
      <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Your current numbers</p>
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Visitors per month</span>
            <FormInput type="number" min="0" value={monthlyVisitors} onChange={(event) => setMonthlyVisitors(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Current conversion %</span>
            <FormInput type="number" min="0" step="0.1" value={conversionRate} onChange={(event) => setConversionRate(event.target.value)} />
            <span className="mt-2 block text-sm text-slate-500">Orders ÷ visitors. Average is 2-3%.</span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Average order value</span>
            <FormInput type="number" min="0" step="0.01" value={averageOrderValue} onChange={(event) => setAverageOrderValue(event.target.value)} />
            <span className="mt-2 block text-sm text-slate-500">Total revenue ÷ total orders</span>
          </label>
        </div>
        <FormButton type="submit" className="mt-8 w-full">Calculate ROI</FormButton>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Results</p>
        <div className="mt-6">
          {result ? (
            <CalculatedResults result={result} exportPayload={exportPayload} />
          ) : (
            <FreeToolEmptyResults
              title="Enter your numbers to see your ROI"
              body="We’ll estimate your conversion lift, new revenue, payback period, and annual return in one view."
            />
          )}
        </div>
      </section>
    </form>
  );
}
