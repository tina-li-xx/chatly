import type { ReactNode } from "react";
import { PublicSiteShell } from "../public-site-shell";

export function BlogShell({ children }: { children: ReactNode }) {
  return <PublicSiteShell>{children}</PublicSiteShell>;
}
