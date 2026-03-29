"use client";

import { useState } from "react";

function sharePopup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=640,height=540");
}

export function BlogShareButtons({
  title,
  url,
  orientation = "vertical"
}: {
  title: string;
  url: string;
  orientation?: "vertical" | "horizontal";
}) {
  const [copied, setCopied] = useState(false);

  const layoutClassName =
    orientation === "horizontal" ? "flex-row justify-start" : "flex-col items-start";

  return (
    <div className={`flex gap-3 ${layoutClassName}`}>
      <button
        type="button"
        onClick={() => sharePopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
        aria-label="Share on Twitter"
      >
        X
      </button>
      <button
        type="button"
        onClick={() => sharePopup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
        aria-label="Share on LinkedIn"
      >
        in
      </button>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
        className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
        aria-label="Copy link"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
