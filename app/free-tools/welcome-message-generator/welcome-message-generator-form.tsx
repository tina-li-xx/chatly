"use client";

import { useState } from "react";
import { FormButton, FormSelect } from "../../ui/form-controls";
import { FreeToolEmptyResults } from "../free-tool-page-shared";
import { FreeToolExportGate } from "../free-tool-export-gate";
import {
  generateWelcomeMessageVariants,
  type WelcomeMessageScenario,
  type WelcomeMessageTone,
  type WelcomeMessageVariant
} from "@/lib/welcome-message-generator";

export function WelcomeMessageGeneratorForm() {
  const [scenario, setScenario] = useState<WelcomeMessageScenario>("pricing");
  const [tone, setTone] = useState<WelcomeMessageTone>("friendly");
  const [generation, setGeneration] = useState(0);
  const [variants, setVariants] = useState<WelcomeMessageVariant[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function showVariants(nextGeneration: number) {
    setVariants(generateWelcomeMessageVariants(scenario, tone, nextGeneration));
    setGeneration(nextGeneration);
    setCopiedId(null);
  }

  function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    showVariants(0);
  }

  async function handleCopy(variant: WelcomeMessageVariant) {
    await navigator.clipboard.writeText(variant.message);
    setCopiedId(variant.id);
  }

  return (
    <form className="grid gap-8 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]" onSubmit={handleGenerate}>
      <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Scenario</span>
          <FormSelect value={scenario} onChange={(event) => setScenario(event.target.value as WelcomeMessageScenario)}>
            <option value="pricing">Pricing page</option>
            <option value="product">Product page</option>
            <option value="support">Support question</option>
            <option value="checkout">Checkout hesitation</option>
          </FormSelect>
        </label>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Tone</span>
          <FormSelect value={tone} onChange={(event) => setTone(event.target.value as WelcomeMessageTone)}>
            <option value="friendly">Friendly</option>
            <option value="direct">Direct</option>
            <option value="concierge">Concierge</option>
          </FormSelect>
        </label>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <FormButton type="submit" className="w-full">Generate variations</FormButton>
          <FormButton type="button" variant="secondary" className="w-full" onClick={() => showVariants(generation + 1)}>
            Regenerate set
          </FormButton>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-8">
        {!variants.length ? (
          <FreeToolEmptyResults
            title="Choose a scenario to generate your welcome messages"
            body="You’ll get a recommended message plus a couple of alternate variations you can copy or refine."
          />
        ) : (
          <div className="space-y-5">
            <article className="rounded-[18px] border border-blue-100 bg-white px-5 py-5 shadow-[0_18px_36px_rgba(37,99,235,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">{variants[0].label}</p>
                  <p className="mt-1 text-sm text-slate-500">Best all-around message for this page and tone.</p>
                </div>
                <button type="button" onClick={() => handleCopy(variants[0])} className="text-sm font-semibold text-blue-600">
                  {copiedId === variants[0].id ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-4 text-base leading-8 text-slate-700">{variants[0].message}</p>
            </article>

            <div className="grid gap-4">
              {variants.slice(1).map((variant) => (
                <article key={variant.id} className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{variant.label}</p>
                    <button type="button" onClick={() => handleCopy(variant)} className="text-sm font-semibold text-blue-600">
                      {copiedId === variant.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-4 text-base leading-8 text-slate-700">{variant.message}</p>
                </article>
              ))}
            </div>

            <FreeToolExportGate
              toolSlug="welcome-message-generator"
              source="free-tools-welcome-message"
              resultPayload={{
                scenarioLabel:
                  scenario === "pricing"
                    ? "Pricing page"
                    : scenario === "product"
                      ? "Product page"
                      : scenario === "support"
                        ? "Support question"
                        : "Checkout hesitation",
                toneLabel: tone[0].toUpperCase() + tone.slice(1),
                variants
              }}
              title="Send these message variations to your inbox"
              buttonLabel="Send my variations"
            />
          </div>
        )}
      </section>
    </form>
  );
}
