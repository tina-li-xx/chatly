import Link from "next/link";
import { ButtonLink } from "./components/ui/Button";
import { ChatBubbleIcon, EyeIcon, UsersIcon } from "./dashboard/dashboard-ui";

const LANDING_NAV_ITEMS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#docs", label: "Docs" }
] as const;

const TEXT_LINK_CLASS = "text-sm font-medium text-slate-600 transition hover:text-slate-900";

export function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className={`inline-flex h-9 items-center rounded-full px-3 ${TEXT_LINK_CLASS} hover:bg-white lg:h-auto lg:px-0 lg:hover:bg-transparent`}
    >
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]">
              <ChatBubbleIcon className="h-[18px] w-[18px] translate-x-[1px]" />
            </div>
            <span className="truncate text-lg font-semibold text-slate-900">Chatting</span>
          </div>

          <nav className="order-3 w-full overflow-x-auto lg:order-none lg:w-auto">
            <div className="flex min-w-max items-center gap-1 rounded-[20px] border border-slate-200/80 bg-slate-50/90 p-1 lg:min-w-0 lg:flex-wrap lg:justify-center lg:gap-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
              {LANDING_NAV_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:justify-end">
            <Link href="/login" className={TEXT_LINK_CLASS}>
              Sign in
            </Link>
            <ButtonLink href="/login" size="md">
              <span className="sm:hidden">Start free</span>
              <span className="hidden sm:inline">Start free trial</span>
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
