"use client";

import { useState } from "react";
import { FormButton, FormInput } from "../ui/form-controls";
import { useToast } from "../ui/toast-provider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FreeToolExportGate({
  toolSlug,
  source,
  resultPayload,
  title = "Send this report to your inbox",
  description = "Enter your email and we’ll send a downloadable export with the result details.",
  buttonLabel = "Send my report"
}: {
  toolSlug: string;
  source: string;
  resultPayload: unknown;
  title?: string;
  description?: string;
  buttonLabel?: string;
}) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const invalid = !EMAIL_PATTERN.test(normalizedEmail);

    setIsInvalid(invalid);
    if (invalid) {
      showToast("error", "Enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/public/free-tool-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, toolSlug, source, resultPayload })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast(
          "error",
          "We couldn't send your report.",
          payload.error === "free_tool_export_delivery_failed"
            ? "Your email was saved, but the export delivery failed. Please try again."
            : "Please try again in a moment."
        );
        return;
      }

      setEmail("");
      setIsInvalid(false);
      setSubmitted(true);
      showToast("success", "Report sent.", "Check your inbox for the exported report.");
    } catch {
      showToast("error", "We couldn't send your report.", "Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[18px] border border-slate-200 bg-white px-5 py-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
        <div className="flex-1">
          <FormInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@example.com"
            aria-invalid={isInvalid}
            className={isInvalid ? "border-rose-400 focus:border-rose-500" : ""}
          />
          {isInvalid ? <p className="mt-2 text-sm text-rose-600">Please enter a real email address.</p> : null}
          {!isInvalid && submitted ? <p className="mt-2 text-sm text-emerald-700">Your report is on the way.</p> : null}
        </div>
        <FormButton type="submit" disabled={isSubmitting} className="sm:w-auto">
          <span className="inline-flex items-center gap-2">
            {isSubmitting ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" /> : null}
            <span>{buttonLabel}</span>
          </span>
        </FormButton>
      </form>
    </section>
  );
}
