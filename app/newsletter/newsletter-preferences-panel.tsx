"use client";

import { useState } from "react";
import { Button, ButtonLink } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";

type NewsletterPreferencesPanelProps = {
  email: string;
  initialSubscribed: boolean;
  token: string;
};

export function NewsletterPreferencesPanel({
  email,
  initialSubscribed,
  token
}: NewsletterPreferencesPanelProps) {
  const { showToast } = useToast();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [saving, setSaving] = useState(false);

  async function updateSubscription(nextSubscribed: boolean) {
    try {
      setSaving(true);
      const response = await fetch("/api/public/newsletter/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, subscribed: nextSubscribed })
      });
      const payload = (await response.json()) as {
        subscribed?: boolean;
        error?: string;
      };

      if (!response.ok) {
        showToast(
          "error",
          "We couldn't update your preferences.",
          payload.error === "invalid_preferences_token"
            ? "That link is invalid or expired."
            : "Please try again in a moment."
        );
        return;
      }

      setSubscribed(Boolean(payload.subscribed));
      showToast(
        "success",
        nextSubscribed ? "Preferences updated." : "You're unsubscribed.",
        nextSubscribed
          ? "You'll keep receiving new Chatting articles."
          : "You won't receive newsletter emails anymore."
      );
    } catch {
      showToast(
        "error",
        "We couldn't update your preferences.",
        "Please try again in a moment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-tide">Newsletter preferences</p>
        <h1 className="display-font mt-3 text-4xl text-ink">
          {subscribed ? "You're subscribed." : "You're unsubscribed."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          These updates go to <span className="font-semibold text-slate-900">{email}</span>.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Newsletter emails</p>
            <p className="mt-1 text-sm text-slate-500">
              Practical live chat tips, support playbooks, and new blog posts.
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              subscribed
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {subscribed ? "On" : "Off"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          disabled={saving}
          onClick={() => updateSubscription(!subscribed)}
        >
          {saving
            ? "Saving..."
            : subscribed
              ? "Unsubscribe"
              : "Resume newsletter"}
        </Button>
        <ButtonLink href="/blog" variant="secondary">
          Read the blog
        </ButtonLink>
      </div>
    </div>
  );
}
