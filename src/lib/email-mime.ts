export type EmailAttachment = {
  fileName: string;
  contentType: string;
  content: Buffer;
};

type BuildMimeMessageInput = {
  to: string;
  from: string;
  replyTo?: string | null;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  attachments?: EmailAttachment[];
};

function createBoundary(prefix: string) {
  return `=_${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function encodeSubject(subject: string) {
  return `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
}

function chunkBase64(value: string) {
  return (value.match(/.{1,76}/g) || []).join("\r\n");
}

function addAlternativePart(lines: string[], boundary: string, contentType: string, content: string) {
  lines.push(`--${boundary}`);
  lines.push(`Content-Type: ${contentType}; charset=utf-8`);
  lines.push("Content-Transfer-Encoding: 8bit");
  lines.push("");
  lines.push(content);
  lines.push("");
}

export function buildMimeMessage({
  to,
  from,
  replyTo,
  subject,
  bodyText,
  bodyHtml,
  attachments = []
}: BuildMimeMessageInput) {
  const mixedBoundary = attachments.length > 0 ? createBoundary("mixed") : null;
  const alternativeBoundary = createBoundary("alt");
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0"
  ];

  if (replyTo) {
    lines.push(`Reply-To: ${replyTo}`);
  }

  if (mixedBoundary) {
    lines.push(`Content-Type: multipart/mixed; boundary="${mixedBoundary}"`);
    lines.push("");
    lines.push(`--${mixedBoundary}`);
  }

  lines.push(`Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`);
  lines.push("");

  addAlternativePart(lines, alternativeBoundary, "text/plain", bodyText);
  addAlternativePart(lines, alternativeBoundary, "text/html", bodyHtml);
  lines.push(`--${alternativeBoundary}--`);

  if (!mixedBoundary) {
    return lines.join("\r\n");
  }

  lines.push("");

  for (const attachment of attachments) {
    lines.push(`--${mixedBoundary}`);
    lines.push(`Content-Type: ${attachment.contentType}; name="${attachment.fileName}"`);
    lines.push("Content-Transfer-Encoding: base64");
    lines.push(`Content-Disposition: attachment; filename="${attachment.fileName}"`);
    lines.push("");
    lines.push(chunkBase64(attachment.content.toString("base64")));
    lines.push("");
  }

  lines.push(`--${mixedBoundary}--`);
  return lines.join("\r\n");
}

