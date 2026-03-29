export type BlogCategorySlug =
  | "live-chat-tips"
  | "small-teams"
  | "conversion"
  | "how-to-guides"
  | "product"
  | "case-studies"
  | "comparisons";

export type BlogCalloutTone = "tip" | "warning" | "danger" | "success";

export type BlogCategory = {
  slug: BlogCategorySlug;
  label: string;
  description: string;
  badgeClassName: string;
};

export type BlogAuthor = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  links: Array<{ label: string; href: string }>;
};

export type BlogImage = {
  src: string;
  alt: string;
};

export type BlogComparisonRow = {
  label: string;
  values: string[];
};

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type BlogSectionBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; tone: BlogCalloutTone; title: string; text: string }
  | { type: "quote"; text: string }
  | { type: "faq"; items: BlogFaqItem[] }
  | { type: "cta"; title: string; text: string; buttonLabel: string; href: string }
  | { type: "code"; code: string; language?: string }
  | { type: "template"; title: string; lines: string[] }
  | {
      type: "chat-example";
      label: string;
      messages: Array<{ role: "visitor" | "team"; text: string }>;
    }
  | {
      type: "comparison";
      columns: string[];
      highlightedColumn?: number;
      rows: BlogComparisonRow[];
    };

export type BlogSection = {
  id: string;
  title: string;
  blocks: BlogSectionBlock[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  subtitle: string;
  seoTitle?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  authorSlug: string;
  categorySlug: BlogCategorySlug;
  image: BlogImage;
  featured?: boolean;
  showInlineCta?: boolean;
  aliases?: string[];
  relatedSlugs: string[];
  sections: BlogSection[];
};

export type BlogPostWithDetails = BlogPost & {
  author: BlogAuthor;
  category: BlogCategory;
};
