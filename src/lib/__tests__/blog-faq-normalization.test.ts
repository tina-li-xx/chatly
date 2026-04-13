import { normalizeBlogFaqSections } from "@/lib/blog-faq-normalization";

describe("blog faq normalization", () => {
  it("moves mixed faq blocks into a standalone FAQ section", () => {
    const sections = normalizeBlogFaqSections([
      {
        id: "bottom-line",
        title: "Bottom line",
        blocks: [
          { type: "paragraph", text: "Paragraph" },
          {
            type: "faq",
            items: [{ question: "Question?", answer: "Answer." }]
          },
          {
            type: "cta",
            title: "Start chatting free",
            text: "CTA copy",
            buttonLabel: "Start chatting free",
            href: "/signup"
          }
        ]
      }
    ]);

    expect(sections).toEqual([
      {
        id: "bottom-line",
        title: "Bottom line",
        blocks: [
          { type: "paragraph", text: "Paragraph" },
          {
            type: "cta",
            title: "Start chatting free",
            text: "CTA copy",
            buttonLabel: "Start chatting free",
            href: "/signup"
          }
        ]
      },
      {
        id: "faq",
        title: "FAQ",
        blocks: [
          {
            type: "faq",
            items: [{ question: "Question?", answer: "Answer." }]
          }
        ]
      }
    ]);
  });
});
