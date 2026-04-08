import { INTEGRATION_OAUTH_MESSAGE_TYPE } from "@/lib/browser-event-contracts";

type PopupSuccessDetail = {
  type: typeof INTEGRATION_OAUTH_MESSAGE_TYPE;
} & (
  | {
      provider: "slack";
      outcome: "success";
      workspaceName: string;
    }
  | {
      provider: "shopify";
      outcome: "success";
      domain: string;
    }
);

function html(body: string) {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

export function integrationPopupSuccessResponse(detail: PopupSuccessDetail) {
  const payload = JSON.stringify(detail).replace(/</g, "\\u003c");
  const label = detail.provider === "slack" ? "Slack" : "Shopify";
  return html(`<!doctype html>
<html lang="en">
  <body style="font-family:system-ui;padding:24px;color:#0f172a">
    <p>${label} connected. You can close this window.</p>
    <script>
      const payload = ${payload};
      if (window.opener) {
        window.opener.postMessage(payload, window.location.origin);
        window.close();
      }
    </script>
  </body>
</html>`);
}

export function integrationPopupErrorResponse(
  message: string,
  provider: "slack" | "shopify" = "slack"
) {
  const safeMessage = message.replace(/</g, "&lt;");
  const label = provider === "slack" ? "Slack" : "Shopify";
  return html(`<!doctype html>
<html lang="en">
  <body style="font-family:system-ui;padding:24px;color:#0f172a">
    <h1 style="font-size:20px;margin:0 0 12px">${label} connection failed</h1>
    <p style="margin:0 0 16px;color:#475569">${safeMessage}</p>
    <button onclick="window.close()" style="height:44px;padding:0 16px;border:0;border-radius:12px;background:#0f172a;color:#fff;font-weight:600;cursor:pointer">Close</button>
  </body>
</html>`);
}
