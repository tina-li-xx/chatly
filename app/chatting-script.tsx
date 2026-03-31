"use client";

import Script from "next/script";

export default function ChattingScript() {
  return (
    <Script
      src="/widget.js"
      data-site-id="a21f48aa-2b94-4f7a-aa75-6ab968729518"
      strategy="afterInteractive"
    />
  );
}
