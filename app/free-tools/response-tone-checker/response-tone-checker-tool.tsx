"use client";

import { useState } from "react";
import { FormButton, FormSelect, FormTextarea } from "../../ui/form-controls";
import { useToast } from "../../ui/toast-provider";
import {
  FreeToolEmptyResults
} from "../free-tool-page-shared";
import {
  responseToneContexts,
  validateResponseToneMessage,
  type ResponseToneAnalysis,
  type ResponseToneContext
} from "@/lib/response-tone-checker";
import { ResponseToneCheckerResults } from "./response-tone-checker-results";

function helperText(error: string | null, length: number) {
  if (error === "MESSAGE_TOO_SHORT") {
    return "Message too short to analyze.";
  }
  if (error === "MESSAGE_TOO_LONG") {
    return "Keep it under 2000 characters for analysis.";
  }
  return `${length}/2000 characters`;
}

export function ResponseToneCheckerTool() {
  const { showToast } = useToast();
  const [draft, setDraft] = useState("Hi there! I'd be happy to help. Could you share your order number so I can look into this for you?");
  const [context, setContext] = useState<ResponseToneContext>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResponseToneAnalysis | null>(null);
  const error = validateResponseToneMessage(draft);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (error) {
      showToast("error", error === "MESSAGE_TOO_LONG" ? "Message is too long." : "Message is too short.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/public/response-tone-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft.trim(), context })
      });
      const payload = (await response.json()) as { analysis?: ResponseToneAnalysis; error?: string };

      if (!response.ok || !payload.analysis) {
        showToast("error", "We couldn't analyze that reply.", "Please try again in a moment.");
        return;
      }

      setResult(payload.analysis);
    } catch {
      showToast("error", "We couldn't analyze that reply.", "Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-8 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]" onSubmit={handleSubmit}>
      <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Context</span>
          <FormSelect value={context} onChange={(event) => setContext(event.target.value as ResponseToneContext)}>
            {responseToneContexts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </FormSelect>
        </label>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Message</span>
          <FormTextarea rows={11} value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <div className={`mt-2 text-sm ${error ? "text-amber-600" : "text-slate-500"}`}>{helperText(error, draft.trim().length)}</div>
        <p className="mt-2 text-sm text-slate-500">Best with English-language customer service replies.</p>
        <FormButton type="submit" disabled={Boolean(error) || isSubmitting} className="mt-8 w-full">
          {isSubmitting ? "Analyzing..." : "Analyze tone"}
        </FormButton>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:px-8">
        {!result ? (
          <FreeToolEmptyResults
            title="Analyze a reply to see how it lands"
            body="You’ll get an overall score, five tone dimensions, flagged issues, strengths, and a rewritten version."
          />
        ) : (
          <ResponseToneCheckerResults
            analysis={result}
            contextLabel={responseToneContexts.find((option) => option.value === context)?.label ?? "General"}
            message={draft.trim()}
          />
        )}
      </section>
    </form>
  );
}
