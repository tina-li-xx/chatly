import { escapeHtml } from "@/lib/utils";

export function renderTranscriptRecapPanel(transcript: string) {
  const rows = transcript
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line, index) =>
        `<tr><td style="padding:${index === 0 ? "0" : "10px"} 0 0;font:400 14px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
          line
        )}</td></tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC;"><tr><td style="padding:24px;"><div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Conversation recap</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin-top:12px;">${rows}</table></td></tr></table>`;
}
