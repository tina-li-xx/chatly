"use client";

import { ButtonLink, type ButtonLinkProps } from "./components/ui/Button";
import { trackGrometricsEvent, type GrometricsEventProperties } from "@/lib/grometrics";

type GrometricsButtonLinkProps = ButtonLinkProps & {
  eventName: string;
  eventProperties?: GrometricsEventProperties;
};

export function GrometricsButtonLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}: GrometricsButtonLinkProps) {
  return (
    <ButtonLink
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          trackGrometricsEvent(eventName, eventProperties);
        }
      }}
    />
  );
}
