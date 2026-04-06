import type { Metadata } from "next";
import Link from "next/link";
import { verifyEmailWithToken } from "@/lib/auth-email-verification";
import { NO_INDEX_METADATA } from "@/lib/site-seo";

type VerifyPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Email Verification | Chatting",
  ...NO_INDEX_METADATA
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  let verified = false;

  if (token) {
    try {
      await verifyEmailWithToken(token);
      verified = true;
    } catch {
      verified = false;
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-xl">
        <div className="glass-panel rounded-[2rem] p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.28em] text-tide">
            {verified ? "Email verified" : "Verification link expired"}
          </p>
          <h1 className="display-font mt-3 text-4xl text-ink">
            {verified ? "You're all set." : "That link didn't work."}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {verified
              ? "Your email address is verified. You can sign in and keep going."
              : "That verification link is invalid or has expired. Request a fresh one to finish verifying your email."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=verify"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Resend verification email
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
