import type { ReactNode } from "react";
import { LandingFinalCtaFooter } from "./landing-page-final-cta-footer";

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  children
}: LegalPageShellProps) {
  return (
    <div className="bg-white text-slate-900">
      <main className="px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p>
          <h1 className="display-font mt-4 text-5xl text-slate-900">{title}</h1>
          <div className="mt-8 space-y-5 text-[15px] leading-8 text-slate-600">{children}</div>
        </div>
      </main>
      <LandingFinalCtaFooter />
    </div>
  );
}
