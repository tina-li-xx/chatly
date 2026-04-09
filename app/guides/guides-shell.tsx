import type { ReactNode } from "react";
import { PublicSiteShell } from "../public-site-shell";

export function GuidesShell({ children }: { children: ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>;
}
