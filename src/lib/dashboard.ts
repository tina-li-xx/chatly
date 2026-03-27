import type { Site } from "@/lib/types";
import { getPublicAppUrl } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";

const APP_URL = getPublicAppUrl();

export function getWidgetSnippet(site: Site) {
  return `<script
  src="${escapeHtml(APP_URL)}/widget.js"
  data-site-id="${escapeHtml(site.id)}"
></script>`;
}
