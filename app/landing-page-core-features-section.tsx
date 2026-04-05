import { ButtonLink } from "./components/ui/Button";
import {
  ContactContextFeatureIllustration,
  InboxFeatureIllustration,
  OfflineFeatureIllustration,
  VisitorsFeatureIllustration
} from "./landing-page-feature-illustrations";

const coreFeatures = [
  {
    number: "1",
    title: "Catch buyers before they leave",
    body: "See who's on your site right now. What page they're on. How long they've been there.",
    detail: "Spot someone stuck on pricing for 8 minutes → start a conversation → remove the hesitation → close the deal.",
    close: "This is how small teams outsell bigger competitors.",
    reverse: false,
    Illustration: VisitorsFeatureIllustration
  },
  {
    number: "2",
    title: "Reply faster than your competitors",
    body: "Every conversation in one place. No missed messages. No delays.",
    detail:
      "Chats automatically route to the right person—sales questions to sales, support issues to support. Assign conversations, tag them, search them, and use keyboard shortcuts for speed.",
    close: "Your team of 3 responds faster than their team of 30.",
    reverse: true,
    Illustration: InboxFeatureIllustration
  },
  {
    number: "3",
    title: "Turn missed chats into revenue",
    body: "Not online? No problem.",
    detail:
      "Set business hours. Show a custom offline message. Auto-reply instantly so visitors know you got their message, then capture their email. Follow up later — your reply goes straight to their inbox, and they can reply back into the chat.",
    close: "No lead left behind. Even at 2am.",
    reverse: false,
    Illustration: OfflineFeatureIllustration
  },
  {
    number: "4",
    title: "Know who you're talking to",
    body:
      "When a visitor shares their email, they stop being a session and start being a person. Their history follows them across devices, sessions, and conversations.",
    detail:
      "See past chats, pages visited, notes, company details, and the context your team needs to reply personally — without asking the same questions again.",
    close: "This isn't a CRM. It's just enough context to know who you're talking to.",
    reverse: true,
    Illustration: ContactContextFeatureIllustration
  }
] as const;

function CoreFeatureCard({
  close,
  detail,
  Illustration,
  number,
  reverse,
  title,
  body
}: (typeof coreFeatures)[number]) {
  const illustrationOrder = reverse ? "lg:order-2" : "";
  const copyOrder = reverse ? "lg:order-1" : "";

  return (
    <article className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-[0_18px_44px_rgba(15,23,42,0.05)] sm:p-8 lg:p-12">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={illustrationOrder}>
          <Illustration />
        </div>
        <div className={copyOrder}>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue-600 text-sm font-semibold text-white">
            {number}
          </span>
          <h3 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">{title}</h3>
          <div className="mt-5 space-y-4 text-[17px] leading-8 text-slate-600">
            <p>{body}</p>
            <p className="text-base leading-7 text-slate-500">{detail}</p>
            <p className="font-semibold text-slate-900">{close}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export function LandingCoreFeaturesSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="display-font text-4xl leading-[1.12] text-slate-900 sm:text-5xl">
            Four features that pay for themselves.
          </h2>
        </div>

        <div className="mt-16 space-y-8">
          {coreFeatures.map((feature) => (
            <CoreFeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl px-6 text-center sm:px-10">
          <p className="text-xl font-medium leading-8 text-slate-700">
            This is all most teams need to convert more visitors.
          </p>
          <div className="mt-6">
            <ButtonLink
              href="/signup"
              className="shadow-[0_10px_26px_rgba(37,99,235,0.28)] hover:-translate-y-0.5"
              trailingIcon={<span aria-hidden="true">→</span>}
            >
              Start chatting free
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
