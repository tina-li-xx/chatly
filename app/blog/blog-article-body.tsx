import type { BlogCalloutTone, BlogPostWithDetails, BlogSectionBlock } from "@/lib/blog-types";
import { BlogInlineCta } from "./blog-email-capture";
import { BlogComparisonTable } from "./blog-comparison-table";

const calloutStyles: Record<BlogCalloutTone, string> = {
  tip: "border-blue-600 bg-blue-50 text-slate-700",
  warning: "border-amber-500 bg-amber-50 text-slate-700",
  danger: "border-rose-500 bg-rose-50 text-slate-700",
  success: "border-emerald-500 bg-emerald-50 text-slate-700"
};

function getChecklistItem(item: string) {
  if (item.startsWith("✓ ")) {
    return { icon: "✓", text: item.slice(2), tone: "success" as const };
  }

  if (item.startsWith("✗ ")) {
    return { icon: "✗", text: item.slice(2), tone: "danger" as const };
  }

  return null;
}

function BlogBlock({ block }: { block: BlogSectionBlock }) {
  if (block.type === "paragraph") {
    return <p>{block.text}</p>;
  }

  if (block.type === "list") {
    const checklistItems = !block.ordered ? block.items.map(getChecklistItem) : [];
    const validChecklistItems = checklistItems.filter(
      (item): item is NonNullable<(typeof checklistItems)[number]> => Boolean(item)
    );

    if (validChecklistItems.length > 0 && validChecklistItems.length === checklistItems.length) {
      return (
        <ul className="m-0 list-none space-y-3 pl-0">
          {validChecklistItems.map((item) => (
            <li key={item.text} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.tone === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      );
    }

    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "callout") {
    return (
      <aside className={`rounded-r-xl border-l-4 px-6 py-5 ${calloutStyles[block.tone]}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-current">{block.title}</p>
        <p className="mt-2 text-[15px] leading-7">{block.text}</p>
      </aside>
    );
  }

  if (block.type === "quote") {
    return <blockquote>{block.text}</blockquote>;
  }

  if (block.type === "faq") {
    return (
      <section className="space-y-6">
        {block.items.map((item) => (
          <div key={item.question} className="rounded-[20px] border border-slate-200 bg-white px-6 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h3 className="text-xl font-semibold text-slate-900">{item.question}</h3>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">{item.answer}</p>
          </div>
        ))}
      </section>
    );
  }

  if (block.type === "cta") {
    return (
      <section className="rounded-[28px] bg-blue-50 px-8 py-10 text-center">
        <h3 className="display-font text-3xl text-slate-900">{block.title}</h3>
        {block.text ? <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">{block.text}</p> : null}
        <a
          href={block.href}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {block.buttonLabel}
          <span aria-hidden="true">→</span>
        </a>
      </section>
    );
  }

  if (block.type === "code") {
    return (
      <pre>
        <code>{block.code}</code>
      </pre>
    );
  }

  if (block.type === "template") {
    return (
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">Template: {block.title}</p>
          <span className="text-xs font-semibold text-blue-600">Copy</span>
        </div>
        <pre className="m-0 overflow-x-auto bg-transparent px-5 py-5 text-sm leading-7 text-slate-700">
          <code>{block.lines.join("\n")}</code>
        </pre>
      </section>
    );
  }

  if (block.type === "chat-example") {
    return (
      <section className="rounded-[20px] bg-slate-50 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{block.label}</p>
        <div className="mt-4 space-y-4">
          {block.messages.map((message) => (
            <div
              key={`${message.role}-${message.text}`}
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "visitor"
                  ? "rounded-bl-md bg-slate-200 text-slate-700"
                  : "ml-auto rounded-br-md bg-blue-600 text-white"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return <BlogComparisonTable block={block} />;
}

export function BlogArticleBody({ post }: { post: BlogPostWithDetails }) {
  return (
    <div className="blog-prose">
      {post.sections.map((section, index) => {
        const hasSectionCta = section.blocks.some((block) => block.type === "cta");
        return (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2>{section.title}</h2>
            {section.blocks.map((block, blockIndex) => (
              <BlogBlock key={`${section.id}-${block.type}-${blockIndex}`} block={block} />
            ))}
            {index === 1 && post.showInlineCta !== false && !hasSectionCta ? <BlogInlineCta /> : null}
          </section>
        );
      })}
    </div>
  );
}
