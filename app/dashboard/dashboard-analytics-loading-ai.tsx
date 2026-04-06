"use client";

import { SkeletonCard, SkeletonLine } from "./dashboard-analytics-loading-primitives";
import { TeamSkeleton } from "./dashboard-analytics-loading-sections";

export function ToolbarSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <SkeletonLine className="h-4 w-44" />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
        <div className="h-10 w-40 rounded-lg bg-white" />
        <div className="h-10 w-28 rounded-lg bg-white" />
      </div>
    </div>
  );
}

export function AiAssistSkeleton() {
  return (
    <SkeletonCard className="space-y-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between gap-4">
          <div>
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="mt-3 h-6 w-36" />
          </div>
          <SkeletonLine className="h-8 w-28" />
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="h-3 rounded-full bg-slate-200" />
          <div className="mt-4 flex items-center justify-between gap-4">
            <SkeletonLine className="h-6 w-40" />
            <SkeletonLine className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="animate-pulse rounded-xl bg-slate-50 px-5 py-5">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="mt-3 h-7 w-20" />
            <SkeletonLine className="mt-3 h-3 w-14" />
          </div>
        ))}
      </div>
      <SkeletonCard>
        <div className="animate-pulse">
          <SkeletonLine className="h-5 w-28" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <SkeletonLine className="h-3 w-32" />
                  <SkeletonLine className="h-3 w-8" />
                </div>
                <div className="h-3 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </SkeletonCard>
      <TeamSkeleton />
      <SkeletonCard>
        <div className="animate-pulse">
          <SkeletonLine className="h-5 w-28" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white px-4 py-4">
                <SkeletonLine className="h-3 w-12" />
                <SkeletonLine className="mt-3 h-5 w-16" />
              </div>
            ))}
          </div>
          <SkeletonLine className="mt-4 h-3 w-72" />
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <div className="animate-pulse">
          <SkeletonLine className="h-5 w-28" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100" />
                <div className="flex-1">
                  <SkeletonLine className="h-3 w-40" />
                  <SkeletonLine className="mt-2 h-3 w-56" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SkeletonCard>
    </SkeletonCard>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <SkeletonLine className="h-4 w-32" />
        <div className="mt-4 flex items-center justify-between gap-4">
          <SkeletonLine className="h-8 w-48" />
          <SkeletonLine className="h-10 w-28" />
        </div>
      </div>
      <SkeletonCard>
        <div className="grid animate-pulse gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-10 rounded-lg bg-slate-50" />
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <div className="animate-pulse space-y-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-100" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <SkeletonLine className="h-3 w-56" />
                  <SkeletonLine className="h-3 w-12" />
                </div>
                <SkeletonLine className="mt-2 h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
