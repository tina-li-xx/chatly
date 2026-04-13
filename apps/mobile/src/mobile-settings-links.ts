export const MOBILE_HELP_CENTER_URL = "https://usechatting.com/guides";
export const MOBILE_TERMS_URL = "https://usechatting.com/terms";
export const MOBILE_PRIVACY_URL = "https://usechatting.com/privacy";
export const MOBILE_BLOG_URL = "https://usechatting.com/blog";
export const MOBILE_X_URL = "https://x.com/usechatting";
export const MOBILE_SUPPORT_EMAIL = "hello@usechatting.com";

export function buildMailto(subject: string, body: string) {
  const params = new URLSearchParams({
    subject,
    body
  });
  return `mailto:${MOBILE_SUPPORT_EMAIL}?${params.toString()}`;
}
