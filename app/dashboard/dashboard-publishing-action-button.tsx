"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DashboardPublishingActionResult } from "./dashboard-publishing-action-shared";
import { Button } from "../components/ui/Button";
import { useToast } from "../ui/toast-provider";

export function DashboardPublishingActionButton({
  action,
  disabled = false,
  idleLabel,
  onComplete,
  onStart,
  pendingLabel,
  redirectOnSuccess,
  showToastOnRedirect = false,
  refreshOnSuccess = true,
  variant = "secondary"
}: {
  action: () => Promise<DashboardPublishingActionResult>;
  disabled?: boolean;
  idleLabel: string;
  onComplete?: () => void;
  onStart?: () => void;
  pendingLabel: string;
  redirectOnSuccess?: string;
  showToastOnRedirect?: boolean;
  refreshOnSuccess?: boolean;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const pending = isPending || isRefreshing;

  return (
    <Button
      type="button"
      variant={variant}
      size="md"
      disabled={disabled || pending}
      onClick={async () => {
        onStart?.();
        setIsPending(true);

        try {
          const result = await action();
          const redirectPath = result.redirectPath || (result.ok ? redirectOnSuccess : undefined);

          if (!redirectPath || showToastOnRedirect) {
            showToast(result.tone, result.title, result.message);
          }

          if (redirectPath) {
            startTransition(() => {
              router.push(redirectPath as Route);
            });
            return;
          }

          if (result.ok && refreshOnSuccess) {
            startTransition(() => {
              router.refresh();
            });
          }
        } finally {
          onComplete?.();
          setIsPending(false);
        }
      }}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
