"use client";

import { useEffect, useState } from "react";

export function BlogTableOfContents({
  items
}: {
  items: Array<{ id: string; title: string }>;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.4, 0.7] }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="sticky top-24">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Table of contents</p>
      <nav className="space-y-2 border-l border-slate-200 pl-4 text-sm">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block transition ${
              activeId === item.id ? "font-medium text-blue-600" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
