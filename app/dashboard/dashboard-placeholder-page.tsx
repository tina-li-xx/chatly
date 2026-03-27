import { DashboardLink } from "./dashboard-shell";

export function DashboardPlaceholderPage({
  description
}: {
  description: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <DashboardLink
          href="/dashboard/inbox"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Open Inbox
        </DashboardLink>
        <DashboardLink
          href="/dashboard"
          className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Home
        </DashboardLink>
      </div>
    </section>
  );
}
