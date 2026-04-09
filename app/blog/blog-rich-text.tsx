import { Fragment, type ReactNode } from "react";

export function renderBlogRichText(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}
