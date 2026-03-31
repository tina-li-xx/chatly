import Link from "next/link";
import { ButtonLink } from "./components/ui/Button";
import { ChatBubbleIcon, EyeIcon, UsersIcon } from "./dashboard/dashboard-ui";

export function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
      {children}
    </a>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">{children}</p>;
}

export function PillarIcon({ icon }: { icon: string }) {
  if (icon === "eye") {
    return <EyeIcon className="h-6 w-6" />;
  }

  if (icon === "users") {
    return <UsersIcon className="h-6 w-6" />;
  }

  return <ChatBubbleIcon className="h-6 w-6" />;
}

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl lg:fixed lg:left-0 lg:right-0 lg:top-0 lg:z-50">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]">
              <ChatBubbleIcon className="h-[18px] w-[18px] translate-x-[1px]" />
            </div>
            <span className="text-lg font-semibold text-slate-900">Chatting</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#how-it-works">How it works</NavLink>
            <NavLink href="#docs">Docs</NavLink>
          </nav>

          <div className="flex items-center justify-center gap-4 lg:justify-end">
            <Link href="/login" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Sign in
            </Link>
            <ButtonLink
              href="/login"
              size="md"
            >
              Start free trial
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
