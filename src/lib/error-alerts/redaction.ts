const MAX_VALUE_LENGTH = 4000;
const SENSITIVE_KEY_PATTERN =
  /(pass(word)?|token|secret|authorization|cookie|session|api[-_]?key|refresh)/i;

function truncateValue(value: string) {
  if (value.length <= MAX_VALUE_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_VALUE_LENGTH)}... [truncated]`;
}

export function escapeHtmlForAlert(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeAlertValue(
  value: unknown,
  parentKey?: string,
  seen = new WeakSet<object>()
): unknown {
  if (parentKey && SENSITIVE_KEY_PATTERN.test(parentKey)) {
    return "[REDACTED]";
  }

  if (value == null) {
    return value;
  }

  if (typeof value === "string") {
    return truncateValue(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Buffer.isBuffer(value)) {
    return `[Buffer ${value.length} bytes]`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: truncateValue(value.message),
      stack: value.stack ? truncateValue(value.stack) : undefined
    };
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeAlertValue(entry, parentKey, seen));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (seen.has(record)) {
      return "[Circular]";
    }

    seen.add(record);

    return Object.entries(record).reduce<Record<string, unknown>>((result, [key, entry]) => {
      result[key] = sanitizeAlertValue(entry, key, seen);
      return result;
    }, {});
  }

  return String(value);
}

export function stringifyAlertValue(value: unknown) {
  if (value === undefined) {
    return "undefined";
  }

  try {
    return truncateValue(JSON.stringify(sanitizeAlertValue(value), null, 2));
  } catch (error) {
    return error instanceof Error ? truncateValue(error.message) : "Unable to serialize value";
  }
}
