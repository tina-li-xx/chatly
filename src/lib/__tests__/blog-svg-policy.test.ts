import { readFileSync } from "node:fs";
import path from "node:path";
import { generatedBlogPosts } from "@/lib/generated-blog-posts";
import { BLOG_SVG_CAPTION_Y_MIN, findBlogSvgBodyTextViolations } from "../../../scripts/blog-svg-policy.mjs";

describe("blog svg caption policy", () => {
  it("allows svg text in the bottom caption zone", () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <text x="96" y="520">Title</text>
        <text x="96" y="582">Subtitle</text>
      </svg>
    `;

    expect(findBlogSvgBodyTextViolations(svg)).toEqual([]);
  });

  it("flags svg text above the bottom caption zone", () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <text x="600" y="170">Body copy</text>
        <text x="96" y="542">Title</text>
      </svg>
    `;

    expect(findBlogSvgBodyTextViolations(svg)).toEqual([{ y: 170 }]);
  });

  it("keeps all blog svg assets free of body text", () => {
    const rootDir = process.cwd();
    const imageSources = [...new Set(generatedBlogPosts.map((post) => post.image.src).filter((src) => src.endsWith(".svg")))];

    for (const imageSrc of imageSources) {
      const svgSource = readFileSync(path.join(rootDir, "public", imageSrc.replace(/^\/+/, "")), "utf8");
      const violations = findBlogSvgBodyTextViolations(svgSource);

      expect(
        violations,
        `${imageSrc} contains SVG text above the bottom caption zone (y < ${BLOG_SVG_CAPTION_Y_MIN}).`
      ).toEqual([]);
    }
  });
});
