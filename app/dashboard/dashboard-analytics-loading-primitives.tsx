"use client";

import type { ReactNode } from "react";

export function SkeletonLine({ className }: { className: string }) {
  return <div className={`rounded-full bg-slate-100 ${className}`} />;
}

export function SkeletonCard({
  className = "",
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}>{children}</div>;
}
