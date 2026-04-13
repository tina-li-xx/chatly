import type { DashboardLiveMessage } from "./live-events";

export function consumeSseMessages(buffer: string) {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const parts = normalized.split("\n\n");
  const rest = normalized.endsWith("\n\n") ? "" : (parts.pop() ?? "");
  const messages: DashboardLiveMessage[] = [];

  for (const part of parts) {
    const payload = readSsePayload(part);
    if (!payload) {
      continue;
    }

    try {
      messages.push(JSON.parse(payload) as DashboardLiveMessage);
    } catch {
      continue;
    }
  }

  return { messages, rest };
}

function readSsePayload(part: string) {
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of part.split("\n")) {
    if (!line || line.startsWith(":")) {
      continue;
    }
    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim();
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  if (eventName === "ping" || !dataLines.length) {
    return null;
  }

  return dataLines.join("\n");
}
