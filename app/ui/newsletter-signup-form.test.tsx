import { renderToStaticMarkup } from "react-dom/server";
import { NewsletterSignupForm } from "./newsletter-signup-form";

describe("newsletter signup form", () => {
  it("renders the shared public newsletter form shell", () => {
    const html = renderToStaticMarkup(
      <NewsletterSignupForm source="blog-newsletter-card" />
    );

    expect(html).toContain("email@example.com");
    expect(html).toContain("Subscribe");
  });
});
