"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FormButton } from "../ui/form-controls";
import { useToast } from "../ui/toast-provider";
import { getVisitorNoteSelection, readVisitorNoteDeeplink } from "./dashboard-visitor-note-deeplink";
import { DashboardVisitorNoteMentionField } from "./dashboard-visitor-note-mention-field";
import { buildVisitorNoteMentionWarning } from "./dashboard-visitor-note-mentions";
import { buildVisitorNoteIdentityParams } from "./dashboard-visitor-note-shared";
import { DashboardVisitorNoteSkeleton } from "./dashboard-visitor-note-skeleton";
import { errorMessageForCode } from "./dashboard-client.utils";
import type { MentionableTeammate } from "@/lib/mention-identities";
import { formatRelativeTime } from "@/lib/utils";

type VisitorNoteEditorProps = {
  conversationId?: string | null;
  siteId?: string | null;
  sessionId?: string | null;
  email?: string | null;
};

type VisitorNotePayload = {
  ok: boolean;
  note?: string | null;
  updatedAt?: string | null;
  mentionableUsers?: MentionableTeammate[];
  sent?: string[];
  ambiguous?: string[];
  unresolved?: string[];
  disabled?: string[];
  error?: string;
};
export function DashboardVisitorNoteEditor(props: VisitorNoteEditorProps) {
  const { showToast } = useToast();
  const params = useMemo(() => buildVisitorNoteIdentityParams(props), [props.conversationId, props.email, props.sessionId, props.siteId]);
  const deeplink = useMemo(() => readVisitorNoteDeeplink(props.conversationId), [props.conversationId]);
  const textareaId = useMemo(() => `dashboard-visitor-note-${props.conversationId ?? props.siteId ?? "current"}`, [props.conversationId, props.siteId]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [mentionableUsers, setMentionableUsers] = useState<MentionableTeammate[]>([]);
  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);

  useEffect(() => {
    if (!params) {
      setLoading(false);
      setDraft("");
      setSavedNote("");
      setUpdatedAt(null);
      setMentionableUsers([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetch(`/dashboard/visitor-note?${params.toString()}`, {
      method: "GET",
      cache: "no-store"
    })
      .then(async (response) => {
        const payload = (await response.json()) as VisitorNotePayload;
        if (!response.ok || !payload.ok) {
          throw new Error(errorMessageForCode(payload.error ?? "unknown"));
        }
        if (cancelled) {
          return;
        }
        const note = payload.note ?? "";
        setDraft(note);
        setSavedNote(note);
        setUpdatedAt(payload.updatedAt ?? null);
        setMentionableUsers(payload.mentionableUsers ?? []);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setDraft("");
        setSavedNote("");
        setUpdatedAt(null);
        setMentionableUsers([]);
        showToast("error", "We couldn't load visitor notes.", error instanceof Error ? error.message : "Please try again in a moment.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [params, showToast]);

  useEffect(() => {
    if (loading || !deeplink?.focusNote) {
      return;
    }
    const field = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!field) {
      return;
    }
    const selection = getVisitorNoteSelection(savedNote || draft, deeplink);
    field.focus();
    if (selection) {
      field.setSelectionRange(selection.start, selection.end);
    }
  }, [deeplink, draft, loading, savedNote, textareaId]);

  async function handleSave() {
    if (!params || saving) {
      return;
    }
    const submittedNote = draft;
    const previousSavedNote = savedNote;
    const previousUpdatedAt = updatedAt;
    const optimisticUpdatedAt = new Date().toISOString();
    const formData = new FormData();
    for (const [key, value] of params.entries()) {
      formData.set(key, value);
    }
    formData.set("note", submittedNote);
    setSavedNote(submittedNote);
    setUpdatedAt(optimisticUpdatedAt);
    setSaving(true);
    try {
      const response = await fetch("/dashboard/visitor-note", {
        method: "POST",
        body: formData
      });
      const payload = (await response.json()) as VisitorNotePayload;
      if (!response.ok || !payload.ok) {
        throw new Error(errorMessageForCode(payload.error ?? "unknown"));
      }
      const nextNote = payload.note ?? "";
      setSavedNote(nextNote);
      setUpdatedAt(payload.updatedAt ?? optimisticUpdatedAt);
      if (draftRef.current.trim() === submittedNote.trim()) {
        setDraft(nextNote);
      }
      showToast("success", nextNote ? "Visitor note saved." : "Visitor note cleared.");
      const mentionWarning = buildVisitorNoteMentionWarning(payload);
      if (mentionWarning) {
        showToast("warning", "Some mentions need attention.", mentionWarning);
      }
    } catch (error) {
      setSavedNote(previousSavedNote);
      setUpdatedAt(previousUpdatedAt);
      showToast("error", "We couldn't save the visitor note.", error instanceof Error ? error.message : "Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <DashboardVisitorNoteSkeleton />;
  }

  return (
    <div className="space-y-3">
      {deeplink?.note ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Mentioned note</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{deeplink.note}</p>
        </div>
      ) : null}
      <DashboardVisitorNoteMentionField
        id={textareaId}
        value={draft}
        onChange={setDraft}
        mentionableUsers={mentionableUsers}
        placeholder="Add context, objections, or follow-up details for this visitor."
      />
      <div className="space-y-2">
        <p className="text-xs leading-5 text-slate-400">
          {updatedAt ? `Updated ${formatRelativeTime(updatedAt)}` : "Saved and shared across this visitor's conversations."}
        </p>
        <div className="flex justify-end">
          <FormButton
            type="button"
            size="md"
            onClick={() => void handleSave()}
            disabled={saving || draft.trim() === savedNote.trim()}
            className="w-full sm:min-w-[108px] sm:w-auto"
          >
            Save note
          </FormButton>
        </div>
      </div>
    </div>
  );
}
