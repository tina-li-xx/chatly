"use client";

import { ChatBubbleIcon } from "../dashboard/dashboard-ui";
import { FormButton, FormTextField } from "../ui/form-controls";

function websiteLabel(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return "yoursite.com";
  }

  try {
    return new URL(/^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`).host;
  } catch {
    return normalized.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  }
}

export function OnboardingCustomizeTransitionScreen({
  websiteUrl,
  siteName,
  title = "Customize",
  description = "Opening your widget setup now.",
  buttonLabel = "Opening setup..."
}: {
  websiteUrl: string;
  siteName: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
}) {
  const siteHost = websiteLabel(websiteUrl);

  return (
    <main className="min-h-dvh bg-slate-50 p-3 sm:p-4 lg:h-dvh lg:overflow-hidden lg:p-6">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1180px] overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:min-h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-3rem)] lg:min-h-0 lg:grid-cols-[minmax(480px,530px)_minmax(0,1fr)]">
        <section className="flex flex-col border-b border-slate-200/80 bg-white px-6 py-8 sm:px-10 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-12 xl:px-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <ChatBubbleIcon className="h-5 w-5" />
            </div>
            <span className="display-font text-3xl text-slate-900">Chatting</span>
          </div>

          <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-6 lg:py-8">
            <div className="mb-12 flex items-start">
              {["Customize", "Install", "Done"].map((label, index) => (
                <div key={label} className="flex min-w-0 flex-1 items-start">
                  <div className="flex shrink-0 flex-col items-center text-center">
                    <div
                      className={[
                        "h-3 w-3 rounded-full transition-all",
                        index === 0 ? "scale-125 bg-blue-600 ring-4 ring-blue-100" : "bg-slate-200"
                      ].join(" ")}
                    />
                    <p className="mt-3 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
                      {label}
                    </p>
                  </div>
                  {index < 2 ? <div className="mx-3 mt-[6px] h-[2px] flex-1 bg-slate-200" /> : null}
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h1 className="display-font text-[2.75rem] leading-tight text-slate-900">{title}</h1>
              <p className="mt-3 text-[15px] leading-7 text-slate-500">{description}</p>
            </div>

            <div className="space-y-6">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  Set the title, look, and status visitors see first.
                </p>

                <div className="mt-5 space-y-5">
                  <FormTextField
                    label="Website URL"
                    name="websiteUrlPreview"
                    type="text"
                    value={websiteUrl}
                    readOnly
                    onChange={() => {}}
                  />

                  <FormTextField
                    label="Widget title"
                    name="widgetTitlePreview"
                    type="text"
                    value="Talk to the team"
                    readOnly
                    onChange={() => {}}
                  />

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-slate-700">Brand color</p>
                      <span className="font-mono text-xs uppercase tracking-[0.14em] text-slate-400">#2563EB</span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-blue-600" />
                      <p className="text-sm text-slate-500">Loading your workspace...</p>
                    </div>
                  </div>
                </div>
              </div>

              <FormButton type="button" fullWidth disabled>
                {buttonLabel}
              </FormButton>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_24%),linear-gradient(180deg,#F8FAFC_0%,#EFF6FF_100%)] px-8 py-10 lg:flex lg:min-h-0 lg:items-center lg:justify-center xl:px-14">
          <div className="relative w-full max-w-[760px] overflow-hidden rounded-[32px] border border-white/70 bg-white/88 shadow-[0_30px_90px_rgba(37,99,235,0.12)] backdrop-blur">
            <div className="flex h-11 items-center gap-2 border-b border-slate-200 bg-slate-100/90 px-4">
              <span className="h-3 w-3 rounded-full bg-rose-300" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-300" />
              <div className="ml-4 h-7 w-full rounded-full bg-white/80" />
            </div>

            <div className="relative h-[520px] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),linear-gradient(180deg,#F8FAFC_0%,#EFF6FF_100%)] px-8 py-8 sm:px-10 sm:py-10">
              <div className="grid gap-5 opacity-80 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                  <div className="grid gap-4 pt-6 sm:grid-cols-2">
                    <div className="h-40 rounded-[30px] bg-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
                    <div className="h-40 rounded-[30px] bg-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
                  </div>
                </div>
                <div className="space-y-4 pt-8 sm:pt-12">
                  <div className="h-24 rounded-[28px] bg-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
                  <div className="h-32 rounded-[28px] bg-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]" />
                </div>
              </div>

              <div className="absolute bottom-8 right-10 z-10 w-[min(100%,376px)] rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(37,99,235,0.14)]">
                <div className="rounded-t-[26px] bg-blue-600 px-5 py-4 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-sm font-semibold text-white">
                          {siteName
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part.charAt(0).toUpperCase())
                            .join("")}
                        </span>
                        <div>
                          <p className="text-[15px] font-semibold">Talk to the team</p>
                          <p className="mt-1 text-sm text-white/80">Online • Replies in minutes</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                      <span>−</span>
                      <span>×</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-white px-5 py-5 text-sm text-slate-700">
                  <div className="max-w-[82%] rounded-[20px] bg-slate-100 px-4 py-3">
                    Hi there. Have a question? We&apos;re here to help.
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-[20px] bg-blue-600 px-4 py-3 text-white">
                    Happy to help. What would you like to know?
                  </div>
                </div>

                <div className="border-t border-slate-200 px-5 py-4">
                  <div className="flex items-center justify-between rounded-full bg-slate-50 px-4 py-3 text-slate-400">
                    <span>Type a message...</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">→</div>
                  </div>
                </div>
              </div>

              <div className="absolute left-10 top-8 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
                {siteHost}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
