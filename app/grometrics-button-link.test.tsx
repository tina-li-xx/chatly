import type { ReactElement } from "react";

vi.mock("@/lib/grometrics", () => ({
  trackGrometricsEvent: vi.fn()
}));

import { trackGrometricsEvent } from "@/lib/grometrics";
import { GrometricsButtonLink } from "./grometrics-button-link";

describe("grometrics button link", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("tracks the configured event on click", () => {
    const onClick = vi.fn();
    const element = GrometricsButtonLink({
      href: "/signup",
      children: "Start",
      eventName: "signup_started",
      eventProperties: { source: "landing_hero" },
      onClick
    }) as ReactElement<{ onClick?: (event: { defaultPrevented: boolean }) => void }>;
    const event = { defaultPrevented: false };

    element.props.onClick?.(event);

    expect(onClick).toHaveBeenCalledWith(event);
    expect(trackGrometricsEvent).toHaveBeenCalledWith("signup_started", { source: "landing_hero" });
  });

  it("skips tracking when navigation is prevented", () => {
    const element = GrometricsButtonLink({
      href: "/signup",
      children: "Start",
      eventName: "signup_started",
      onClick: (event) => {
        (event as { defaultPrevented: boolean }).defaultPrevented = true;
      }
    }) as ReactElement<{ onClick?: (event: { defaultPrevented: boolean }) => void }>;

    element.props.onClick?.({ defaultPrevented: false });

    expect(trackGrometricsEvent).not.toHaveBeenCalled();
  });
});
