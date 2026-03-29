import type {
  BlogComparisonRow,
  BlogFaqItem,
  BlogSection,
  BlogSectionBlock
} from "@/lib/blog-types";

export function section(id: string, title: string, blocks: BlogSectionBlock[]): BlogSection {
  return { id, title, blocks };
}

export function paragraph(text: string): BlogSectionBlock {
  return { type: "paragraph", text };
}

export function list(items: string[], ordered = false): BlogSectionBlock {
  return ordered ? { type: "list", items, ordered: true } : { type: "list", items };
}

export function quote(text: string): BlogSectionBlock {
  return { type: "quote", text };
}

export function faq(items: BlogFaqItem[]): BlogSectionBlock {
  return { type: "faq", items };
}

export function cta(title: string, text: string, buttonLabel: string, href: string): BlogSectionBlock {
  return { type: "cta", title, text, buttonLabel, href };
}

export function code(codeText: string, language = ""): BlogSectionBlock {
  return { type: "code", code: codeText, language };
}

export function comparison(
  columns: string[],
  rows: BlogComparisonRow[],
  highlightedColumn = 0
): BlogSectionBlock {
  return { type: "comparison", columns, rows, highlightedColumn };
}
