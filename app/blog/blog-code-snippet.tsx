"use client";

import { useEffect, useRef, useState } from "react";

function getSnippetLabel(label?: string) {
  if (!label) {
    return "Code";
  }

  if (label === "http") {
    return "HTTP";
  }

  if (label === "json") {
    return "JSON";
  }

  if (label === "html") {
    return "HTML";
  }

  if (label === "endpoints") {
    return "Endpoints";
  }

  return label;
}

export function BlogCodeSnippet({
  code,
  label
}: {
  code: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
      return;
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      resetTimerRef.current = null;
    }, 1800);
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-800 bg-slate-950 shadow-[0_16px_36px_rgba(15,23,42,0.16)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-400">
            {getSnippetLabel(label)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="blog-code-snippet__pre m-0 overflow-x-auto px-5 py-4 text-[13px] leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
    </section>
  );
}
