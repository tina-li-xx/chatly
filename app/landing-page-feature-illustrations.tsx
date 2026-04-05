import type { ReactNode } from "react";

function PanelShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function VisitorsFeatureIllustration() {
  return (
    <PanelShell className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Live visitors</p>
          <p className="mt-1 text-xs text-slate-500">Visitors browsing right now</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">4 online</span>
      </div>
      <div className="mt-5 space-y-3">
        {[
          { name: "Visitor on /pricing", meta: "London, UK · 8m on page", active: true },
          { name: "Visitor on /demo", meta: "Berlin, DE · 3m on page" },
          { name: "Visitor on /integrations", meta: "Austin, US · 2m on page" }
        ].map((visitor) => (
          <div
            key={visitor.name}
            className={`rounded-[18px] border p-4 ${visitor.active ? "border-blue-200 bg-blue-50 shadow-[0_10px_24px_rgba(37,99,235,0.12)]" : "border-slate-200 bg-white"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{visitor.name}</p>
                <p className="mt-1 text-xs text-slate-500">{visitor.meta}</p>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${visitor.active ? "bg-blue-600" : "bg-emerald-500"}`} />
            </div>
            {visitor.active ? (
              <div className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-blue-700">Start conversation</div>
            ) : null}
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

export function InboxFeatureIllustration() {
  return (
    <PanelShell>
        <div className="grid gap-4 lg:grid-cols-[170px_minmax(0,1fr)]">
          <div className="space-y-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3">
            {["Pricing question", "Need setup help", "Can you do white-label?"].map((item, index) => (
              <div
                key={item}
                className={`rounded-2xl px-3 py-3 text-sm ${index === 0 ? "bg-slate-100 text-slate-900" : "bg-white text-slate-600"}`}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-[18px] border border-slate-200 bg-white p-4">
            <div className="space-y-3">
              <div className="max-w-[85%] rounded-[18px] rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-700">
                We&apos;re comparing Chatting and Intercom. Do you support offline follow-up?
              </div>
              <div className="ml-auto max-w-[78%] rounded-[18px] rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white">
                Yes. Capture the email, then keep the same thread going by email reply.
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Sarah is typing...
              </div>
            </div>
          </div>
        </div>
      </PanelShell>
  );
}

export function OfflineFeatureIllustration() {
  return (
    <div className="relative">
      <PanelShell className="bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_100%)]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Offline widget</p>
              <p className="mt-1 text-xs text-slate-500">Capture the lead after hours</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">2:47 AM</span>
          </div>
          <div className="mt-4 rounded-[20px] bg-slate-50 p-4">
            <p className="text-base font-semibold text-slate-900">We&apos;re offline right now</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Leave your email and we&apos;ll pick this up first thing.</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-400">Your email</div>
              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-400">How can we help?</div>
            </div>
          </div>
        </div>
      </PanelShell>

      <div className="absolute -bottom-7 left-8 max-w-[17rem] rounded-[22px] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_18px_38px_rgba(15,23,42,0.16)]">
        <p className="text-xs font-semibold">Follow-up lands in their inbox</p>
        <div className="mt-3 space-y-2 text-[12px]">
          <div className="rounded-2xl bg-white/10 px-3 py-2">Thanks, here&apos;s the link and pricing breakdown.</div>
          <div className="rounded-2xl bg-blue-500 px-3 py-2">Perfect, can we start next week?</div>
        </div>
      </div>
    </div>
  );
}

export function ContactContextFeatureIllustration() {
  return (
    <PanelShell className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
      <div className="rounded-[22px] border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Customer context</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">Tina Martinez</p>
            <p className="mt-1 text-sm text-slate-500">tina@acme.com · Acme Corp</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Trial user</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">History</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">4 conversations</p>
            <p className="mt-1 text-sm text-slate-500">Last chat: "Annual billing question"</p>
          </div>
          <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Current page</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">/pricing</p>
            <p className="mt-1 text-sm text-slate-500">Returned 4 times this week</p>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">Team note</p>
          <p className="mt-2 text-sm text-slate-700">Following up Tuesday about annual billing discount.</p>
        </div>
      </div>
    </PanelShell>
  );
}
