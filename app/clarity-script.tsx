"use client";

import Script from "next/script";
import { useShouldLoadRemoteScript } from "./use-should-load-remote-script";

const CLARITY_PROJECT_ID = "w6jk7x5ywu";

export default function ClarityScript() {
  const shouldLoad = useShouldLoadRemoteScript();

  return shouldLoad ? (
    <Script id="clarity-script" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  ) : null;
}
