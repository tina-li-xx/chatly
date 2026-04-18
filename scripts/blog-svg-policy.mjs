import { readFile } from "node:fs/promises";
import path from "node:path";

export const BLOG_SVG_CAPTION_Y_MIN = 480;

const svgTextTagPattern = /<text\b([^>]*)>/g;
const svgYAttrPattern = /\by="([^"]+)"/;

function toPublicAssetPath(imageSrc) {
  return imageSrc.replace(/^\/+/, "");
}

export function findBlogSvgBodyTextViolations(svgSource, captionYMin = BLOG_SVG_CAPTION_Y_MIN) {
  return [...svgSource.matchAll(svgTextTagPattern)]
    .map((match) => {
      const yMatch = match[1].match(svgYAttrPattern);
      const y = yMatch ? Number.parseFloat(yMatch[1]) : Number.NaN;

      return Number.isFinite(y) ? { y } : null;
    })
    .filter(Boolean)
    .filter(({ y }) => y < captionYMin);
}

export function formatBlogSvgPolicyError({ fileName, imageSrc, violations, captionYMin = BLOG_SVG_CAPTION_Y_MIN }) {
  const positions = violations.map(({ y }) => y).join(", ");
  return `${fileName} uses body SVG text above y=${captionYMin} in ${imageSrc} (y=${positions}). Blog artwork must keep visible text in the bottom caption area only.`;
}

export async function validateBlogSvgCaptionPolicy({ rootDir, fileName, imageSrc, captionYMin = BLOG_SVG_CAPTION_Y_MIN }) {
  if (!imageSrc.startsWith("/blog/") || !imageSrc.endsWith(".svg")) {
    return null;
  }

  const svgPath = path.join(rootDir, "public", toPublicAssetPath(imageSrc));
  const svgSource = await readFile(svgPath, "utf8");
  const violations = findBlogSvgBodyTextViolations(svgSource, captionYMin);

  if (violations.length === 0) {
    return null;
  }

  return formatBlogSvgPolicyError({ fileName, imageSrc, violations, captionYMin });
}
