import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  BranchIcon,
  CopyIcon,
  MailIcon,
  PaintbrushIcon,
  PaperclipIcon,
  StarIcon,
  UsersIcon
} from "./dashboard/dashboard-ui";

type FeatureIcon = ComponentType<SVGProps<SVGSVGElement>>;

const secondaryFeatures: Array<{
  title: string;
  body: string;
  icon: FeatureIcon;
  tone: string;
}> = [
  {
    title: "Widget Customization",
    body: "Your colors. Your logo. Your welcome message. Looks like you built it. Takes 2 minutes.",
    icon: PaintbrushIcon,
    tone: "bg-blue-50 text-blue-600"
  },
  {
    title: "Analytics",
    body: "Response times. Busiest hours. Team performance. Satisfaction scores. Weekly report to your inbox.",
    icon: BarChartIcon,
    tone: "bg-violet-50 text-violet-600"
  },
  {
    title: "AI Assist",
    body: "Summarize long threads. Get reply suggestions. Auto-tag conversations. You stay in control — AI just makes you faster.",
    icon: StarIcon,
    tone: "bg-amber-50 text-amber-600"
  },
  {
    title: "Automation",
    body: "Send proactive messages on high-intent pages, auto-reply when you're away, suggest FAQs before handoff, and route new conversations to the right teammate.",
    icon: BranchIcon,
    tone: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "Saved Replies",
    body: "Stop typing the same answer. Build a library. Insert with one click.",
    icon: CopyIcon,
    tone: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "File Sharing",
    body: "Send screenshots, PDFs, invoices. Visitors can attach files too.",
    icon: PaperclipIcon,
    tone: "bg-rose-50 text-rose-600"
  },
  {
    title: "Team Management",
    body: "Invite teammates. Assign roles. See who's online.",
    icon: UsersIcon,
    tone: "bg-cyan-50 text-cyan-600"
  },
  {
    title: "Email Notifications",
    body: "New message alerts. Daily digests. @mention notifications. Reply from email.",
    icon: MailIcon,
    tone: "bg-slate-100 text-slate-700"
  }
];

function FeatureTile({
  body,
  icon: Icon,
  title,
  tone
}: {
  body: string;
  icon: FeatureIcon;
  title: string;
  tone: string;
}) {
  return (
    <article className="rounded-[18px] border border-slate-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${tone}`}>
        <Icon className="h-[22px] w-[22px]" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-slate-500">{body}</p>
    </article>
  );
}

export function LandingOtherFeaturesSection() {
  return (
    <section id="everything" className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="display-font text-4xl leading-[1.15] text-slate-900 sm:text-[2.8rem]">
            Everything else you&apos;d expect.
          </h2>
          <p className="display-font mt-2 text-4xl leading-[1.15] text-slate-400 sm:text-[2.8rem]">
            Nothing you don&apos;t need.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {secondaryFeatures.map((feature) => (
            <FeatureTile key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
