"use client";

import { useState } from "react";
import { Button, ButtonLink } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";

type EmailUnsubscribePanelProps = {
  email: string;
  initialSubscribed: boolean;
  token: string;
};

export function EmailUnsubscribePanel({
  email,
  initialSubscribed,
  token
}: EmailUnsubscribePanelProps) {
  const { showToast } = useToast();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [saving, setSaving] = useState(false);

  async function updateSubscription(nextSubscribed: boolean) {
    try {
      setSaving(true);
      const response = await fetch("/api/public/email/unsubscribe", {
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
          "We couldn't update your email preferences.",
          payload.error === "invalid_unsubscribe_token"
            ? "That link is invalid or expired."
            : "Please try again in a moment."
        );
        return;
      }

      setSubscribed(Boolean(payload.subscribed));
      showToast(
        "success",
        nextSubscribed ? "Email preferences updated." : "You're unsubscribed.",
        nextSubscribed
          ? "You'll receive optional Chatting emails again."
          : "You won't receive optional Chatting emails anymore."
      );
    } catch {
      showToast(
        "error",
        "We couldn't update your email preferences.",
        "Please try again in a moment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-tide">Email preferences</p>
        <h1 className="display-font mt-3 text-4xl text-ink">
          {subscribed ? "You're subscribed." : "You're unsubscribed."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          These email updates go to <span className="font-semibold text-slate-900">{email}</span>.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Optional Chatting emails</p>
            <p className="mt-1 text-sm text-slate-500">
              Conversation follow-ups, product updates, reports, reminders, and newsletter updates.
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
              : "Resume emails"}
        </Button>
        <ButtonLink href="/" variant="secondary">
          Back to Chatting
        </ButtonLink>
      </div>
    </div>
  );
}
