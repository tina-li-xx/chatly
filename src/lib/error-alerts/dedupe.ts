const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

type ErrorAlertStore = typeof globalThis & {
  __chattingErrorAlertSentAt?: Map<string, number>;
};

function getAlertStore() {
  const store = globalThis as ErrorAlertStore;
  store.__chattingErrorAlertSentAt ??= new Map<string, number>();
  return store.__chattingErrorAlertSentAt;
}

export function shouldSendErrorAlert(key: string, now = Date.now()) {
  const sentAtByKey = getAlertStore();

  for (const [entryKey, entryTime] of sentAtByKey.entries()) {
    if (now - entryTime > ALERT_COOLDOWN_MS) {
      sentAtByKey.delete(entryKey);
    }
  }

  const lastSentAt = sentAtByKey.get(key);
  if (lastSentAt && now - lastSentAt < ALERT_COOLDOWN_MS) {
    return false;
  }

  sentAtByKey.set(key, now);
  return true;
}
