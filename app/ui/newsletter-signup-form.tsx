"use client";

import { useState } from "react";
import { FormButton, FormInput } from "./form-controls";
import { useToast } from "./toast-provider";

type NewsletterSignupFormProps = {
  source: string;
  dark?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function feedbackText(submitted: boolean, alreadySubscribed: boolean) {
  if (!submitted) {
    return null;
  }

  return alreadySubscribed
    ? "You're already on the list. We'll keep sending new articles to this inbox."
    : "You're subscribed. Check your inbox for a welcome note from Chatting.";
}

export function NewsletterSignupForm({
  source,
  dark = false
}: NewsletterSignupFormProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

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

      const response = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: normalizedEmail,
          source
        })
      });

      const payload = (await response.json()) as {
        alreadySubscribed?: boolean;
        error?: string;
      };

      if (!response.ok) {
        showToast(
          "error",
          "We couldn't save your signup.",
          payload.error === "newsletter_delivery_failed"
            ? "Your email was valid, but the confirmation delivery failed. Please try again."
            : "Please try again in a moment."
        );
        return;
      }

      const duplicate = Boolean(payload.alreadySubscribed);

      setAlreadySubscribed(duplicate);
      setSubmitted(true);
      setEmail("");
      setIsInvalid(false);
      showToast(
        "success",
        duplicate ? "You're already subscribed." : "You're subscribed.",
        duplicate
          ? "We'll keep sending new Chatting articles to this inbox."
          : "Check your inbox for a welcome note."
      );
    } catch {
      showToast(
        "error",
        "We couldn't save your signup.",
        "Please try again in a moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
      <div className="flex-1">
        <FormInput
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-label="Email address"
          placeholder="email@example.com"
          aria-invalid={isInvalid}
          className={`${dark ? "border-white/15 bg-white text-slate-900" : ""} ${isInvalid ? "border-rose-400 focus:border-rose-500" : ""}`}
        />
        {isInvalid ? (
          <p className={`mt-2 text-sm ${dark ? "text-rose-200" : "text-rose-600"}`}>
            Please enter a real email address.
          </p>
        ) : null}
        {!isInvalid && submitted ? (
          <p className={`mt-2 text-sm ${dark ? "text-emerald-200" : "text-emerald-700"}`}>
            {feedbackText(submitted, alreadySubscribed)}
          </p>
        ) : null}
      </div>

      <FormButton type="submit" disabled={isSubmitting} className="sm:w-auto">
        <span className="inline-flex items-center gap-2">
          {isSubmitting ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" /> : null}
          <span>Subscribe</span>
        </span>
      </FormButton>
    </form>
  );
}
