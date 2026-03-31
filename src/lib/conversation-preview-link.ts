export type ConversationPreviewIdentity = {
  teamName: string;
  agentName: string;
  companyName: string;
};

type PreviewPayload = ConversationPreviewIdentity & {
  mode: "preview";
  v: 1;
};

function encode(value: string) {
  if (typeof btoa === "function") {
    return btoa(
      encodeURIComponent(value).replace(
        /%([0-9A-F]{2})/g,
        (_match, hex) => String.fromCharCode(parseInt(hex, 16))
      )
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4 || 4)) % 4)}`;

  if (typeof atob === "function") {
    const binary = atob(padded);
    const escaped = Array.from(
      binary,
      (char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`
    ).join("");
    return decodeURIComponent(escaped);
  }

  return Buffer.from(value, "base64url").toString("utf8");
}

function checksum(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

export function buildConversationPreviewToken(identity: ConversationPreviewIdentity) {
  const payload = encode(JSON.stringify({ ...identity, mode: "preview", v: 1 } satisfies PreviewPayload));
  return `${payload}.${checksum(payload)}`;
}

export function parseConversationPreviewToken(token: string): ConversationPreviewIdentity | null {
  const [payload, signature] = token.trim().split(".");

  if (!payload || !signature || checksum(payload) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as Partial<PreviewPayload>;
    if (
      parsed.v !== 1 ||
      parsed.mode !== "preview" ||
      typeof parsed.teamName !== "string" ||
      typeof parsed.agentName !== "string" ||
      typeof parsed.companyName !== "string"
    ) {
      return null;
    }

    const teamName = parsed.teamName.trim();
    const agentName = parsed.agentName.trim();
    const companyName = parsed.companyName.trim();

    return teamName && agentName && companyName
      ? { teamName, agentName, companyName }
      : null;
  } catch {
    return null;
  }
}

export function buildConversationPreviewLink(appUrl: string, identity: ConversationPreviewIdentity) {
  return `${appUrl.replace(/\/$/, "")}/conversation/${buildConversationPreviewToken(identity)}`;
}
