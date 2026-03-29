import { classNames } from "@/lib/utils";
import type { BlogAuthor, BlogCategory } from "@/lib/blog-types";

export function BlogCategoryBadge({
  category,
  className
}: {
  category: BlogCategory;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        category.badgeClassName,
        className
      )}
    >
      {category.label}
    </span>
  );
}

export function BlogAuthorAvatar({
  author,
  size = "md"
}: {
  author: BlogAuthor;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClassName =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-16 w-16 text-lg"
        : "h-10 w-10 text-sm";

  return (
    <span
      aria-hidden="true"
      className={classNames(
        "inline-flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.38),transparent_34%),linear-gradient(135deg,#2563EB,#1D4ED8)] font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]",
        sizeClassName
      )}
    >
      {author.initials}
    </span>
  );
}
