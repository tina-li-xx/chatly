import type { BlogFaqItem, BlogPost, BlogSection, BlogSectionBlock } from "@/lib/blog-types";

function isFaqBlock(block: BlogSectionBlock): block is Extract<BlogSectionBlock, { type: "faq" }> {
  return block.type === "faq";
}

function isFaqItem(value: unknown): value is BlogFaqItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.question === "string" && item.question.trim().length > 0
    && typeof item.answer === "string" && item.answer.trim().length > 0;
}

function nextFaqId(section: BlogSection, usedIds: Set<string>) {
  const preferredIds = ["faq", `${section.id}-faq`];
  for (const candidate of preferredIds) {
    if (!usedIds.has(candidate)) return candidate;
  }

  let counter = 2;
  while (usedIds.has(`faq-${counter}`)) {
    counter += 1;
  }

  return `faq-${counter}`;
}

export function normalizeBlogFaqSections(sections: BlogSection[]) {
  const normalized: BlogSection[] = [];
  const usedIds = new Set<string>();

  for (const section of sections) {
    const hasFaqBlocks = section.blocks.some(isFaqBlock);
    const faqItems = section.blocks
      .filter(isFaqBlock)
      .flatMap((block) => block.items)
      .filter(isFaqItem);
    const nonFaqBlocks = section.blocks.filter((block) => !isFaqBlock(block));

    if (!faqItems.length) {
      if (hasFaqBlocks && nonFaqBlocks.length) {
        normalized.push({ ...section, blocks: nonFaqBlocks });
      } else if (!hasFaqBlocks) {
        normalized.push(section);
      }

      if (!hasFaqBlocks || nonFaqBlocks.length) {
        usedIds.add(section.id);
      }
      continue;
    }

    if (nonFaqBlocks.length) {
      normalized.push({ ...section, blocks: nonFaqBlocks });
      usedIds.add(section.id);
    }

    const faqId = nextFaqId(section, usedIds);
    normalized.push({
      id: faqId,
      title: "FAQ",
      blocks: [{ type: "faq", items: faqItems }]
    });
    usedIds.add(faqId);
  }

  return normalized;
}

export function normalizeBlogPostFaqSections<T extends BlogPost>(post: T): T {
  return { ...post, sections: normalizeBlogFaqSections(post.sections) };
}
