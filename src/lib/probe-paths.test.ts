import { isBlockedProbePath } from "./probe-paths";

describe("isBlockedProbePath", () => {
  it.each([
    "/xmlrpc.php",
    "/wp-login.php",
    "/wp-admin",
    "/wp-admin/install.php",
    "/wordpress",
    "/wordpress/wp-includes/wlwmanifest.xml",
    "/blog/wp-includes/wlwmanifest.xml",
    "/2019/wp-includes/wlwmanifest.xml",
    "WEB/WP-INCLUDES/WLWMANIFEST.XML"
  ])("blocks %s", (pathname) => {
    expect(isBlockedProbePath(pathname)).toBe(true);
  });

  it.each([
    "/",
    "/login",
    "/favicon.ico",
    "/api/public/site-status",
    "/dashboard/inbox",
    "/widget.js",
    "/wp-content/uploads/logo.png"
  ])("allows %s", (pathname) => {
    expect(isBlockedProbePath(pathname)).toBe(false);
  });
});
