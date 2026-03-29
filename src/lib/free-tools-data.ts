export type FreeToolCategorySlug =
  | "calculators"
  | "generators"
  | "templates"
  | "analyzers";

export type FreeToolCategory = {
  slug: FreeToolCategorySlug;
  label: string;
  description: string;
};

export type FreeToolFaqItem = {
  question: string;
  answer: string;
};

export type FreeTool = {
  slug: string;
  category: FreeToolCategorySlug;
  kind: string;
  iconLabel: string;
  title: string;
  excerpt: string;
  description: string;
  href: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  highlights: string[];
  featured?: boolean;
};

export const freeToolCategories: FreeToolCategory[] = [
  { slug: "calculators", label: "Calculators", description: "Benchmarks, savings, and ROI math." },
  { slug: "generators", label: "Generators", description: "Prompts, greetings, and copy helpers." },
  { slug: "templates", label: "Templates", description: "Reusable replies and support workflows." },
  { slug: "analyzers", label: "Analyzers", description: "Conversation scoring and quality checks." }
];

const freeTools: FreeTool[] = [
  {
    slug: "response-time-calculator",
    category: "calculators",
    kind: "Calculator",
    iconLabel: "FRT",
    title: "Response Time Calculator",
    excerpt: "Grade your response speed against practical support benchmarks and get clear ways to improve.",
    description:
      "Measure how your current first-response time stacks up, see where you land, and get small-team tactics to reply faster.",
    href: "/free-tools/response-time-calculator",
    updatedAt: "2026-03-29T09:00:00.000Z",
    seoTitle: "Response Time Calculator | Free Tool | Chatting",
    seoDescription:
      "See how your support response times compare to useful benchmarks. Free calculator for small teams.",
    highlights: ["Industry benchmarks", "Letter grade", "Improvement tips"],
    featured: true
  },
  {
    slug: "live-chat-roi-calculator",
    category: "calculators",
    kind: "Calculator",
    iconLabel: "ROI",
    title: "Live Chat ROI Calculator",
    excerpt: "Calculate the revenue lift, payback period, and ROI of adding live chat to your site.",
    description:
      "Plug in your monthly visitors, current conversion rate, and average order value to estimate the impact of faster conversations.",
    href: "/free-tools/live-chat-roi-calculator",
    updatedAt: "2026-03-29T09:00:00.000Z",
    seoTitle: "Live Chat ROI Calculator | Free Tool | Chatting",
    seoDescription:
      "Calculate how much revenue live chat could add to your business. Free, fast, and built for small teams.",
    highlights: ["3 quick inputs", "Instant ROI math", "Payback period"]
  },
  {
    slug: "welcome-message-generator",
    category: "generators",
    kind: "Generator",
    iconLabel: "MSG",
    title: "Welcome Message Generator",
    excerpt: "Generate stronger live chat greetings for pricing pages, product pages, support, and more.",
    description:
      "Choose your scenario and tone, then generate a welcome message that feels warm, direct, and useful instead of robotic.",
    href: "/free-tools/welcome-message-generator",
    updatedAt: "2026-03-29T09:00:00.000Z",
    seoTitle: "Welcome Message Generator | Free Tool | Chatting",
    seoDescription:
      "Generate live chat welcome messages for common support and sales scenarios. Free tool from Chatting.",
    highlights: ["Scenario-based copy", "Friendly tone options", "Copy-ready output"]
  },
  {
    slug: "response-template-library",
    category: "templates",
    kind: "Templates",
    iconLabel: "TPL",
    title: "Response Template Library",
    excerpt: "Browse ready-to-use replies for greetings, escalations, handoffs, apologies, and follow-up chats.",
    description:
      "Search a focused library of support templates and copy the ones that fit your workflow, tone, and common customer questions.",
    href: "/free-tools/response-template-library",
    updatedAt: "2026-03-29T09:00:00.000Z",
    seoTitle: "Response Template Library | Free Tool | Chatting",
    seoDescription:
      "Find customer service response templates for live chat, handoffs, apologies, and follow-ups.",
    highlights: ["Searchable templates", "Copy in one click", "Support scenarios"]
  },
  {
    slug: "response-tone-checker",
    category: "analyzers",
    kind: "Analyzer",
    iconLabel: "TONE",
    title: "Response Tone Checker",
    excerpt: "Paste a support reply and score it for warmth, clarity, and confidence before you send it.",
    description:
      "Check whether a customer support response sounds human, clear, and helpful, then get suggestions to improve the tone.",
    href: "/free-tools/response-tone-checker",
    updatedAt: "2026-03-29T09:00:00.000Z",
    seoTitle: "Response Tone Checker | Free Tool | Chatting",
    seoDescription:
      "Analyze a support reply for tone, empathy, and clarity with this free response checker.",
    highlights: ["Tone score", "Clarity feedback", "Rewrite prompts"]
  }
];

export function getAllFreeTools() {
  return freeTools.slice();
}

export function getFreeToolCategory(slug: string) {
  return freeToolCategories.find((category) => category.slug === slug) || null;
}

export function getFreeToolsByCategory(category: FreeToolCategorySlug | "all") {
  if (category === "all") {
    return getAllFreeTools();
  }

  return getAllFreeTools().filter((tool) => tool.category === category);
}

export function getFeaturedFreeTool() {
  return getAllFreeTools().find((tool) => tool.featured) || getAllFreeTools()[0];
}

export function getFreeToolBySlug(slug: string) {
  return getAllFreeTools().find((tool) => tool.slug === slug) || null;
}

export function getRelatedFreeTools(slug: string, limit = 3) {
  const current = getFreeToolBySlug(slug);
  if (!current) {
    return getAllFreeTools().slice(0, limit);
  }

  const sameCategory = getAllFreeTools().filter((tool) => tool.slug !== slug && tool.category === current.category);
  const remainder = getAllFreeTools().filter((tool) => tool.slug !== slug && tool.category !== current.category);

  return [...sameCategory, ...remainder].slice(0, limit);
}

export function isFreeToolCategorySlug(value: string): value is FreeToolCategorySlug {
  return freeToolCategories.some((category) => category.slug === value);
}
