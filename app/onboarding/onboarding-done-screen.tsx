"use client";

import Link from "next/link";
import type { Route } from "next";
import { CheckCircleIcon, ChevronRightIcon, PaintbrushIcon, UsersIcon } from "../dashboard/dashboard-ui";
import { SuccessConfetti } from "./onboarding-flow-ui";

function DoneCard({
  href,
  title,
  description,
  cta,
  icon
}: {
  href: Route;
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[26px] border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
    >
      <span className="text-blue-600">{icon}</span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
        {cta}
        <ChevronRightIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

export function OnboardingDoneScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-12 sm:px-10">
      <SuccessConfetti />
      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_16px_40px_rgba(22,163,74,0.15)]">
          <CheckCircleIcon className="h-10 w-10" />
        </div>
        <h1 className="display-font mt-8 text-5xl text-slate-900 sm:text-6xl">You&apos;re all set!</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
          Chatting is ready to help you talk to visitors. Your team can start replying the moment the first message comes in.
        </p>

        <div className="mx-auto mt-12 grid max-w-4xl gap-4 lg:grid-cols-3">
          <DoneCard
            href="/dashboard/inbox"
            title="Go to inbox"
            description="Start chatting with visitors and keep every reply in one place."
            cta="Open inbox"
            icon={<PaintbrushIcon className="h-8 w-8" />}
          />
          <DoneCard
            href="/dashboard/team"
            title="Invite your team"
            description="Add the rest of your team when you're ready to share the inbox."
            cta="Manage team"
            icon={<UsersIcon className="h-8 w-8" />}
          />
          <DoneCard
            href="/dashboard/widget"
            title="Customize more"
            description="Fine-tune your widget, install guides, and live preview settings."
            cta="Open widget"
            icon={<PaintbrushIcon className="h-8 w-8" />}
          />
        </div>

        <div className="mt-12">
          <Link
            href="/dashboard/inbox"
            className="inline-flex h-13 items-center justify-center rounded-2xl bg-blue-600 px-8 text-base font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Inbox
          </Link>
          <div className="mt-4">
            <Link href="/dashboard" className="text-sm font-semibold text-blue-600">
              Take a product tour
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .confetti-piece {
          animation: confetti-fall 1.9s ease-out forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: translate3d(0, -80px, 0) rotate(0deg);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 86vh, 0) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
