"use client";

import Script from "next/script";
import { useShouldLoadRemoteScript } from "./use-should-load-remote-script";

const ANALYTICS_SCRIPT_SRC = "https://usegrometrics.com/js/script.js";
const ANALYTICS_WEBSITE_ID = "gm_13c7a11993d9d7ce797e06a3";
const ANALYTICS_DOMAIN = "usechatting.com";

export default function GrometricsScript() {
  const shouldLoad = useShouldLoadRemoteScript();

  return shouldLoad ? (
    <Script
      id="grometrics-script"
      defer
      data-website-id={ANALYTICS_WEBSITE_ID}
      data-domain={ANALYTICS_DOMAIN}
      src={ANALYTICS_SCRIPT_SRC}
      strategy="afterInteractive"
    />
  ) : null;
}
