import { renderLabelText, renderPanel, renderStack } from "@/lib/chatting-email-foundation";
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

  return renderPanel(renderStack([renderLabelText("Conversation recap"), `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">${rows}</table>`], { gap: "12px" }));
}
