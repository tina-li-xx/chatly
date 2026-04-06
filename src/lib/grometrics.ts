type GrometricsEventValue = string | number | boolean | null;

export type GrometricsEventProperties = Record<string, GrometricsEventValue | undefined>;

declare global {
  interface Window {
    grometrics?: {
      event?: (name: string, properties?: Record<string, GrometricsEventValue>) => void;
    };
  }
}

function cleanGrometricsEventProperties(properties?: GrometricsEventProperties) {
  if (!properties) {
    return undefined;
  }

  const entries = Object.entries(properties).filter(([, value]) => value !== undefined);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export function trackGrometricsEvent(name: string, properties?: GrometricsEventProperties) {
  if (typeof window === "undefined") {
    return;
  }

  window.grometrics?.event?.(name, cleanGrometricsEventProperties(properties));
}
