import "server-only";

type PublishingCadencePost = {
  publicationStatus?: string;
  publishedAt: string;
};

const DAILY_PUBLISH_HOUR_UTC = 9;

function dateKey(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function nextCadenceSlot(now: Date) {
  const slot = new Date(now);
  slot.setUTCHours(DAILY_PUBLISH_HOUR_UTC, 0, 0, 0);
  if (slot.getTime() <= now.getTime()) {
    slot.setUTCDate(slot.getUTCDate() + 1);
  }
  return slot;
}

export function getNextDashboardPublishingDate(
  posts: PublishingCadencePost[],
  now = new Date()
) {
  const occupiedDays = new Set(
    posts
      .filter((post) => post.publicationStatus === "scheduled")
      .map((post) => dateKey(post.publishedAt))
      .filter(Boolean)
  );

  const slot = nextCadenceSlot(now);
  while (occupiedDays.has(slot.toISOString().slice(0, 10))) {
    slot.setUTCDate(slot.getUTCDate() + 1);
  }

  return slot.toISOString();
}
