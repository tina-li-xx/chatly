import type { ReactNode } from "react";
import Link from "next/link";
import { ChatBubbleIcon } from "../dashboard/dashboard-ui";
import { LandingFinalCtaFooter } from "../landing-page-final-cta-footer";

const navigationLinks = [
  { label: "Free Tools", href: "/free-tools" },
  { label: "Product", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" }
] as const;

function BlogLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 text-slate-900">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)]">
        <ChatBubbleIcon className="h-[18px] w-[18px] translate-x-[1px]" />
      </span>
      <span className="text-lg font-semibold">Chatting</span>
    </Link>
  );
}

function BlogHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <BlogLogo />
        <nav className="hidden items-center gap-6 md:flex">
          {navigationLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex">
            Sign in
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BlogShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_38%,#f8fafc_100%)] text-slate-900">
      <BlogHeader />
      {children}
      <LandingFinalCtaFooter />
    </div>
  );
}
