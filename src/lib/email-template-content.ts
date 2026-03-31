const HTML_BREAK_PATTERN = /<br\s*\/?>/gi;
const HTML_BLOCK_TAG_PATTERN =
  /<\/?(?:address|article|aside|blockquote|caption|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi;
const HAS_HTML_TAG_PATTERN = /<[^>]+>/;
const HTML_TAG_PATTERN = /<[^>]+>/g;

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&#x27;/gi, "'");
}

function normalizeWhitespace(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeDashboardEmailTemplateContent(value: string) {
  const decoded = decodeBasicHtmlEntities(value);

  if (!HAS_HTML_TAG_PATTERN.test(decoded)) {
    return normalizeWhitespace(decoded);
  }

  return normalizeWhitespace(
    decoded
      .replace(HTML_BREAK_PATTERN, "\n")
      .replace(HTML_BLOCK_TAG_PATTERN, "\n")
      .replace(HTML_TAG_PATTERN, "")
  );
}
