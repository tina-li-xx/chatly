"use client";

import { useEffect, useState } from "react";
import type { DashboardSavedReply } from "@/lib/data/settings-types";
import { Button } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";
import { DashboardModal } from "./dashboard-modal";
import { DashboardSavedRepliesList } from "./dashboard-saved-replies-list";
import { DashboardSavedReplyModal } from "./dashboard-saved-reply-modal";
import {
  buildOptimisticSavedReply,
  EMPTY_SAVED_REPLY,
  parseSavedReplyDraftTags,
  readSavedReplies,
  upsertSavedReply
} from "./dashboard-saved-replies-shared";
import {
  SettingsCard,
  SettingsCardBody,
  SettingsCardEmptyState
} from "./dashboard-settings-shared";

function SavedRepliesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-lg bg-slate-50 px-4 py-4">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="mt-3 h-3 w-full rounded bg-slate-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSavedRepliesManager({ canManage }: { canManage: boolean }) {
  const { showToast } = useToast();
  const [savedReplies, setSavedReplies] = useState<DashboardSavedReply[] | null>(null);
  const [editingReply, setEditingReply] = useState<DashboardSavedReply | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_SAVED_REPLY);
  const [deletingReply, setDeletingReply] = useState<DashboardSavedReply | null>(null);

  useEffect(() => {
    void readSavedReplies()
      .then(setSavedReplies)
      .catch((error) =>
        showToast("error", "We couldn't load saved replies.", error instanceof Error ? error.message : "Please try again in a moment.")
      );
  }, [showToast]);

  function openNewReply() {
    setEditingReply(null);
    setDraft(EMPTY_SAVED_REPLY);
    setEditorOpen(true);
  }

  function startEditingReply(reply: DashboardSavedReply) {
    setEditingReply(reply);
    setDraft({ title: reply.title, body: reply.body, tags: reply.tags.join(", ") });
    setEditorOpen(true);
  }

  async function saveReply() {
    const optimisticReply = editingReply
      ? {
          ...editingReply,
          title: draft.title.trim(),
          body: draft.body.trim(),
          tags: parseSavedReplyDraftTags(draft.tags),
          updatedAt: new Date().toISOString()
        }
      : buildOptimisticSavedReply(draft);
    setEditorOpen(false);
    setEditingReply(null);
    setDraft(EMPTY_SAVED_REPLY);
    setSavedReplies((current) => upsertSavedReply(current ?? [], optimisticReply, editingReply?.id));

    try {
      const response = await fetch("/dashboard/saved-replies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: editingReply ? "update" : "create",
          id: editingReply?.id,
          title: draft.title,
          body: draft.body,
          tags: parseSavedReplyDraftTags(draft.tags)
        })
      });
      const payload = (await response.json()) as { ok?: boolean; savedReply?: DashboardSavedReply; error?: string };
      if (!response.ok || !payload.ok || !payload.savedReply) throw new Error(payload.error || "saved-replies-failed");

      setSavedReplies((current) => upsertSavedReply(current ?? [], payload.savedReply!, optimisticReply.id));
      showToast("success", editingReply ? "Saved reply updated" : "Saved reply created");
    } catch (error) {
      setSavedReplies((current) => (current ?? []).filter((reply) => reply.id !== optimisticReply.id));
      if (editingReply) {
        setSavedReplies((current) => upsertSavedReply(current ?? [], editingReply));
      }
      showToast("error", "We couldn't save that reply.", error instanceof Error ? error.message : "Please try again in a moment.");
    }
  }

  async function deleteReply() {
    if (!deletingReply) return;
    const replyToDelete = deletingReply;
    setDeletingReply(null);
    setSavedReplies((current) => (current ?? []).filter((reply) => reply.id !== replyToDelete.id));

    try {
      const response = await fetch("/dashboard/saved-replies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", id: replyToDelete.id })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "saved-replies-failed");

      showToast("success", "Saved reply deleted");
    } catch (error) {
      setSavedReplies((current) => upsertSavedReply(current ?? [], replyToDelete));
      showToast("error", "We couldn't delete that reply.", error instanceof Error ? error.message : "Please try again in a moment.");
    }
  }

  return (
    <>
      <SettingsCard
        title="Workspace reply library"
        description="Create reusable replies for common questions, then drop them into the inbox and edit before sending."
        className="overflow-hidden"
        actions={canManage ? (
          <Button type="button" size="md" onClick={openNewReply}>New reply</Button>
        ) : undefined}
      >
        {savedReplies === null ? (
          <SettingsCardBody>
            <SavedRepliesSkeleton />
          </SettingsCardBody>
        ) : savedReplies.length ? (
          <DashboardSavedRepliesList
            replies={savedReplies}
            canManage={canManage}
            onEdit={startEditingReply}
            onDelete={setDeletingReply}
          />
        ) : (
          <SettingsCardEmptyState>
            No saved replies yet. Start with pricing, setup, and follow-up replies your team sends all the time.
          </SettingsCardEmptyState>
        )}
      </SettingsCard>

      {editorOpen ? (
        <DashboardSavedReplyModal
          title={editingReply ? "Edit saved reply" : "New saved reply"}
          description="Keep it reusable. Teammates can insert it into the composer and tailor it before sending."
          values={draft}
          saving={false}
          onChange={setDraft}
          onClose={() => {
            setEditorOpen(false);
            setEditingReply(null);
            setDraft(EMPTY_SAVED_REPLY);
          }}
          onSave={saveReply}
        />
      ) : null}

      {deletingReply ? (
        <DashboardModal title="Delete saved reply" description="This removes it from the workspace library for everyone." onClose={() => setDeletingReply(null)} widthClass="max-w-[480px]">
          <div className="px-6 py-5 text-sm leading-6 text-slate-600">
            <p>
              Delete <span className="font-semibold text-slate-900">{deletingReply.title}</span>?
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button type="button" variant="secondary" size="md" onClick={() => setDeletingReply(null)}>Cancel</Button>
            <Button type="button" size="md" onClick={() => void deleteReply()}>Delete</Button>
          </div>
        </DashboardModal>
      ) : null}
    </>
  );
}
