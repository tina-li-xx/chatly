"use client";

import { SkeletonCard, SkeletonLine } from "./dashboard-analytics-loading-primitives";

export function OverviewSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index}>
            <div className="animate-pulse">
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="mt-4 h-8 w-24" />
              <SkeletonLine className="mt-4 h-3 w-16" />
            </div>
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard>
        <div className="animate-pulse">
          <div className="mb-6 flex items-center justify-between gap-4">
            <SkeletonLine className="h-5 w-40" />
            <div className="h-10 w-40 rounded-lg bg-slate-100" />
          </div>
          <div className="grid h-64 grid-cols-8 items-end gap-3 rounded-xl bg-slate-50 px-6 pb-6 pt-10">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="rounded-t-lg bg-slate-200" style={{ height: `${80 + (index % 4) * 28}px` }} />
            ))}
          </div>
        </div>
      </SkeletonCard>
    </>
  );
}

export function ConversationsSkeleton() {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <SkeletonCard key={index}>
            <div className="animate-pulse">
              <SkeletonLine className="h-5 w-40" />
              <SkeletonLine className="mt-2 h-4 w-52" />
              <div className="mt-6 h-56 rounded-xl bg-slate-50" />
            </div>
          </SkeletonCard>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <SkeletonCard key={index}>
            <div className="animate-pulse">
              <SkeletonLine className="h-5 w-36" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 5 }, (_, row) => (
                  <div key={row} className="flex items-center gap-3">
                    <SkeletonLine className="h-3 flex-1" />
                    <SkeletonLine className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>
      <SkeletonCard>
        <div className="animate-pulse">
          <SkeletonLine className="h-5 w-28" />
          <div className="mt-6 h-56 rounded-xl bg-slate-50" />
        </div>
      </SkeletonCard>
    </>
  );
}

export function TeamSkeleton() {
  return (
    <SkeletonCard>
      <div className="animate-pulse">
        <SkeletonLine className="h-5 w-40" />
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-4 bg-slate-50 px-4 py-3">
            {Array.from({ length: 5 }, (_, index) => (
              <SkeletonLine key={index} className="h-3 w-full" />
            ))}
          </div>
          {Array.from({ length: 5 }, (_, row) => (
            <div key={row} className="grid grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] gap-4 border-t border-slate-100 px-4 py-4">
              {Array.from({ length: 5 }, (_, cell) => (
                <SkeletonLine key={cell} className="h-3 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </SkeletonCard>
  );
}
