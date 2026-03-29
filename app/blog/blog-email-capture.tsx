import Link from "next/link";
import { NewsletterSignupForm } from "../ui/newsletter-signup-form";

function BlogEmailForm({ dark = false, source }: { dark?: boolean; source: string }) {
  return <NewsletterSignupForm dark={dark} source={source} />;
}

export function BlogNewsletterCard() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Newsletter</p>
      <h2 className="display-font mt-3 text-3xl text-slate-900">Get chat tips that actually work</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        Join 5,000+ support pros getting weekly insights on turning conversations into customers.
      </p>
      <div className="mt-6 max-w-2xl">
        <BlogEmailForm source="blog-newsletter-card" />
      </div>
    </section>
  );
}

export function BlogInlineCta() {
  return (
    <section className="rounded-[28px] bg-blue-50 px-8 py-10 text-center">
      <h3 className="display-font text-3xl text-slate-900">Ready to talk to your visitors?</h3>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
        Stop losing customers to slow responses. Start with Chatting today, free.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Try Chatting free
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function BlogMobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-700">Try Chatting free</p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Start free
        </Link>
      </div>
    </div>
  );
}
