export const DEFAULT_TIME_ZONE = "UTC";

export function isValidTimeZone(value: string | null | undefined): value is string {
  const candidate = value?.trim();
  if (!candidate) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: candidate }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(
  value: string | null | undefined,
  fallback = DEFAULT_TIME_ZONE
) {
  return isValidTimeZone(value) ? value.trim() : fallback;
}
