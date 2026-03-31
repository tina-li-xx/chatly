"use client";

import Script from "next/script";

export default function ChattingScript() {
  return (
    <Script
      src="https://usechatting.com/widget.js"
      data-site-id="398b43bb-dc54-403c-bedd-5f387ba07092"
      strategy="afterInteractive"
    />
  );
}
