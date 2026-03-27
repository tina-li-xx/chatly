"use client";

import { usePathname } from "next/navigation";

function InboxLoading() {
  return (
    <div className="grid h-full min-h-0 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
      <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:min-h-0 lg:flex-col">
        <div className="border-b border-slate-200 p-4">
          <div className="h-10 rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <div className="h-3 w-24 rounded-full bg-slate-100" />
                  <div className="mt-2 h-3 w-36 rounded-full bg-slate-100" />
                  <div className="mt-3 h-2.5 w-20 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="h-4 w-40 rounded-full bg-slate-100" />
          <div className="mt-2 h-3 w-52 rounded-full bg-slate-100" />
        </div>
        <div className="flex-1 space-y-5 overflow-hidden p-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className={index % 2 ? "flex justify-end" : "flex justify-start"}>
              <div className="max-w-[70%] rounded-xl bg-slate-100 px-4 py-3">
                <div className="h-3 w-28 rounded-full bg-white/80" />
                <div className="mt-2 h-3 w-44 rounded-full bg-white/80" />
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 p-4">
          <div className="h-24 rounded-xl bg-slate-50" />
        </div>
      </section>

      <aside className="hidden min-h-0 bg-white p-5 xl:block">
        <div className="rounded-xl border border-slate-200 p-5">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-100" />
          <div className="mx-auto mt-4 h-4 w-24 rounded-full bg-slate-100" />
          <div className="mx-auto mt-2 h-3 w-32 rounded-full bg-slate-100" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-3 rounded-full bg-slate-100" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function PageLoading() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="h-3 w-24 rounded-full bg-slate-100" />
            <div className="mt-4 h-8 w-20 rounded-full bg-slate-100" />
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-40 rounded-full bg-slate-100" />
          <div className="mt-2 h-3 w-56 rounded-full bg-slate-100" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-16 rounded-xl bg-slate-50" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-4 w-28 rounded-full bg-slate-100" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-12 rounded-lg bg-slate-50" />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-4 w-32 rounded-full bg-slate-100" />
            <div className="mt-5 h-40 rounded-xl bg-slate-50" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DashboardLoading() {
  const pathname = usePathname();

  if (pathname === "/dashboard/inbox") {
    return <InboxLoading />;
  }

  return <PageLoading />;
}
