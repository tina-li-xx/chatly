import { addLiveChatToShopifyPost } from "@/lib/blog-post-add-live-chat-to-shopify";
import { bestIntercomAlternativesSmallTeamsPost } from "@/lib/blog-post-best-intercom-alternatives-small-teams";
import { chatlyVsIntercomPost } from "@/lib/blog-post-chatly-vs-intercom";
import { chatlyVsZendeskPost } from "@/lib/blog-post-chatly-vs-zendesk";
import { liveChatVsContactFormsPost } from "@/lib/blog-post-live-chat-vs-contact-forms";
import { reduceResponseTimeUnderTwoMinutesPost } from "@/lib/blog-post-reduce-response-time-under-2-minutes";
import { wordpressLiveChatSetupPost } from "@/lib/blog-post-wordpress-live-chat-setup";
import type { BlogAuthor, BlogCategory, BlogCategorySlug, BlogPost, BlogPostWithDetails } from "@/lib/blog-types";

const authors: BlogAuthor[] = [
  {
    slug: "sarah-chen",
    name: "Sarah Chen",
    role: "Head of Content at Chatting",
    bio:
      "Sarah has spent the last decade helping small teams build calmer, more confident customer conversations. She writes about chat, support, and the humans behind the screen.",
    initials: "SC",
    links: [
      { label: "Twitter", href: "https://twitter.com/chattinghq" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/chatting" }
    ]
  },
  {
    slug: "tina",
    name: "Tina",
    role: "Growth & Operations at Chatting",
    bio:
      "Tina works with founder-led teams to tighten support loops, reduce response lag, and turn more conversations into customers without overbuilding the process.",
    initials: "T",
    links: [
      { label: "Twitter", href: "https://twitter.com/chattinghq" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/chatting" }
    ]
  }
];

export const blogCategories: BlogCategory[] = [
  {
    slug: "live-chat-tips",
    label: "Live Chat Tips",
    description: "Tactical advice for better conversations.",
    badgeClassName: "bg-blue-50 text-blue-700"
  },
  {
    slug: "small-teams",
    label: "Small Teams",
    description: "Support operations for lean teams.",
    badgeClassName: "bg-teal-50 text-teal-700"
  },
  {
    slug: "conversion",
    label: "Conversion",
    description: "Sales conversations and buyer momentum.",
    badgeClassName: "bg-emerald-50 text-emerald-700"
  },
  {
    slug: "how-to-guides",
    label: "How-To Guides",
    description: "Step-by-step setup and implementation guides.",
    badgeClassName: "bg-violet-50 text-violet-700"
  },
  {
    slug: "product",
    label: "Product",
    description: "Feature launches, how-tos, and product notes.",
    badgeClassName: "bg-violet-50 text-violet-700"
  },
  {
    slug: "case-studies",
    label: "Case Studies",
    description: "Stories and outcomes from real teams.",
    badgeClassName: "bg-amber-50 text-amber-700"
  },
  {
    slug: "comparisons",
    label: "Comparisons",
    description: "Focused comparisons against other tools.",
    badgeClassName: "bg-slate-100 text-slate-700"
  }
];

const posts: BlogPost[] = [
  chatlyVsIntercomPost,
  liveChatVsContactFormsPost,
  addLiveChatToShopifyPost,
  chatlyVsZendeskPost,
  reduceResponseTimeUnderTwoMinutesPost,
  wordpressLiveChatSetupPost,
  bestIntercomAlternativesSmallTeamsPost
];

function withDetails(post: BlogPost): BlogPostWithDetails {
  const author = authors.find((entry) => entry.slug === post.authorSlug);
  const category = blogCategories.find((entry) => entry.slug === post.categorySlug);

  if (!author || !category) {
    throw new Error(`BLOG_DATA_INVALID:${post.slug}`);
  }

  return { ...post, author, category };
}

export function getAllBlogPosts() {
  return posts
    .slice()
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .map(withDetails);
}

export function getFeaturedBlogPost() {
  return getAllBlogPosts().find((post) => post.featured) || getAllBlogPosts()[0];
}

export function getBlogPostBySlug(slug: string) {
  const post = posts.find((entry) => entry.slug === slug || entry.aliases?.includes(slug));
  return post ? withDetails(post) : null;
}

export function getBlogPostsByCategory(categorySlug: BlogCategorySlug | "all") {
  if (categorySlug === "all") {
    return getAllBlogPosts();
  }

  return getAllBlogPosts().filter((post) => post.category.slug === categorySlug);
}

export function getRelatedBlogPosts(post: BlogPostWithDetails, limit = 3) {
  const explicit = post.relatedSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((entry): entry is BlogPostWithDetails => Boolean(entry));

  if (explicit.length >= limit) {
    return explicit.slice(0, limit);
  }

  const fallback = getAllBlogPosts().filter(
    (entry) =>
      entry.slug !== post.slug &&
      entry.category.slug === post.category.slug &&
      !explicit.some((explicitPost) => explicitPost.slug === entry.slug)
  );

  return [...explicit, ...fallback].slice(0, limit);
}

export function isBlogCategorySlug(value: string): value is BlogCategorySlug {
  return blogCategories.some((category) => category.slug === value);
}
