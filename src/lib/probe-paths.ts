const EXACT_BLOCKED_PATHS = new Set(["/xmlrpc.php", "/wp-login.php"]);
const BLOCKED_PREFIXES = ["/wp-admin", "/wordpress"];
const BLOCKED_SUFFIXES = ["/wp-includes/wlwmanifest.xml"];

export function isBlockedProbePath(pathname: string) {
  const normalizedPath = normalizeProbePath(pathname);

  if (EXACT_BLOCKED_PATHS.has(normalizedPath)) {
    return true;
  }

  if (BLOCKED_PREFIXES.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
    return true;
  }

  return BLOCKED_SUFFIXES.some((suffix) => normalizedPath.endsWith(suffix));
}

function normalizeProbePath(pathname: string) {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, "");

  return (withoutTrailingSlash || "/").toLowerCase();
}
