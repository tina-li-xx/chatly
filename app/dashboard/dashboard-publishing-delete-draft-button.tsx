"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";
import { DashboardModal } from "./dashboard-modal";
import { deletePublishingDraftAction } from "./dashboard-publishing-delete-draft-action";

export function DashboardPublishingDeleteDraftButton({ draftId }: { draftId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRedirecting, startTransition] = useTransition();
  const busy = isDeleting || isRedirecting;

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deletePublishingDraftAction(draftId);
      showToast(result.tone, result.title, result.message);

      if (result.redirectPath) {
        startTransition(() => {
          router.push(result.redirectPath as Route);
        });
        return;
      }

      if (result.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="md"
        disabled={busy}
        className="border-red-200 text-red-600 hover:border-red-300 hover:text-red-700"
        onClick={() => setConfirmingDelete(true)}
      >
        Delete draft
      </Button>
      {confirmingDelete ? (
        <DashboardModal
          title="Delete draft"
          description="This removes the draft immediately and returns its topic to Plans."
          onClose={busy ? () => {} : () => setConfirmingDelete(false)}
          widthClass="max-w-[480px]"
        >
          <div className="px-6 py-5 text-sm leading-6 text-slate-600">
            <p>This draft will be removed from Drafts and its topic will be available to generate again.</p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button type="button" variant="secondary" size="md" onClick={() => setConfirmingDelete(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              type="button"
              size="md"
              disabled={busy}
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => void handleDelete()}
            >
              {busy ? "Deleting..." : "Delete draft"}
            </Button>
          </div>
        </DashboardModal>
      ) : null}
    </>
  );
}
