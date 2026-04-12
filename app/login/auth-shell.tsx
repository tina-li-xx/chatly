"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChatBubbleIcon } from "../dashboard/dashboard-ui";

type AuthStat = {
  value: string;
  label: string;
};

export function AuthPageShell({
  heroTitle,
  heroDescription,
  stats,
  children
}: {
  heroTitle: string;
  heroDescription: string;
  stats: AuthStat[];
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(560px,1fr)_minmax(520px,0.92fr)]">
      <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.14),transparent_22%),linear-gradient(180deg,#4F46E5_0%,#4C4AF0_48%,#4338CA_100%)] p-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between xl:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.06),transparent_26%)]" />

        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <ChatBubbleIcon className="h-6 w-6" />
            </div>
            <span className="display-font text-3xl text-white">Chatting</span>
          </div>
        </div>

        <div className="relative max-w-xl">
          <h2 className="display-font text-4xl leading-[1.06] text-white xl:text-5xl">{heroTitle}</h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/90">{heroDescription}</p>
        </div>

        <div className="relative grid grid-cols-3 gap-8">
          {stats.map((item) => (
            <div key={item.label}>
              <div className="display-font text-3xl leading-none text-white xl:text-4xl">{item.value}</div>
              <p className="mt-3 text-sm text-white/80">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="mb-10 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <ChatBubbleIcon className="h-5 w-5" />
            </div>
            <span className="display-font text-3xl text-slate-900">Chatting</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-6 lg:py-12">
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthFormIntro({
  title,
  caption,
  actionLabel,
  onAction
}: {
  title: string;
  caption: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center">
      <h1 className="display-font text-4xl text-slate-900">{title}</h1>
      <p className="mt-4 text-[15px] text-slate-600">
        {caption}
        {actionLabel && onAction ? (
          <>
            {" "}
            <button type="button" onClick={onAction} className="font-semibold text-blue-600">
              {actionLabel}
            </button>
          </>
        ) : null}
      </p>
    </div>
  );
}
