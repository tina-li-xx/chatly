import { simpleParser } from "mailparser";

type ParsedAddressList =
  | {
      value?: Array<{ address?: string | null }>;
    }
  | Array<{
      value?: Array<{ address?: string | null }>;
      address?: string | null;
    }>
  | null
  | undefined;

type SesReceivedNotification = {
  notificationType?: string;
  content?: string;
  mail?: {
    source?: string;
    destination?: string[];
    commonHeaders?: {
      to?: string[];
      cc?: string[];
      replyTo?: string[];
    };
  };
};

type ParsedInboundReply =
  | { ignored: true }
  | {
      ignored: false;
      conversationId: string;
      senderEmail: string | null;
      body: string;
    };

function extractConversationId(addresses: string[]) {
  for (const address of addresses) {
    const match = address.match(/reply\+([a-f0-9-]+)@/i);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function extractSenderEmail(value: string) {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? null;
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function stripQuotedReply(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const trimmed: string[] = [];

  for (const line of lines) {
    const normalized = line.trim();

    if (
      normalized.startsWith(">") ||
      /^On .+wrote:$/i.test(normalized) ||
      normalized === "--- Original Message ---" ||
      /^From:\s/i.test(normalized) ||
      /^Sent:\s/i.test(normalized) ||
      /^To:\s/i.test(normalized) ||
      /^Subject:\s/i.test(normalized)
    ) {
      break;
    }

    trimmed.push(line);
  }

  return trimmed.join("\n").trim();
}

function collectParsedAddresses(list: ParsedAddressList) {
  if (!list) {
    return [];
  }

  if (Array.isArray(list)) {
    return list
      .flatMap((entry) => [entry.address?.trim(), ...(entry.value ?? []).map((item) => item.address?.trim())])
      .filter((value): value is string => Boolean(value));
  }

  return (list.value ?? [])
    .map((entry) => entry.address?.trim())
    .filter((value): value is string => Boolean(value));
}

export async function parseSesInboundReply(rawNotification: string): Promise<ParsedInboundReply> {
  const notification = JSON.parse(rawNotification) as SesReceivedNotification;

  if (notification.notificationType !== "Received") {
    return { ignored: true };
  }

  if (!notification.content?.trim()) {
    throw new Error(
      "SES inbound notification did not include raw email content. Configure the SNS action to include UTF-8 email content."
    );
  }

  const parsed = await simpleParser(notification.content);
  const addresses = [
    ...(notification.mail?.destination ?? []),
    ...(notification.mail?.commonHeaders?.to ?? []),
    ...(notification.mail?.commonHeaders?.cc ?? []),
    ...(notification.mail?.commonHeaders?.replyTo ?? []),
    ...collectParsedAddresses(parsed.to),
    ...collectParsedAddresses(parsed.cc),
    ...collectParsedAddresses(parsed.replyTo)
  ];
  const conversationId = extractConversationId(addresses);

  if (!conversationId) {
    throw new Error("No conversation alias found.");
  }

  const rawText =
    parsed.text?.trim() || (typeof parsed.html === "string" ? stripHtml(parsed.html) : "");
  const body = stripQuotedReply(rawText);

  if (!body) {
    throw new Error("Unable to extract reply body from inbound email.");
  }

  return {
    ignored: false,
    conversationId,
    senderEmail:
      parsed.from?.value?.[0]?.address ?? extractSenderEmail(notification.mail?.source ?? ""),
    body
  };
}
