import Link from "next/link";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog" },
      { label: "Status" }
    ]
  },
  {
    title: "Company",
    links: [{ label: "About" }, { label: "Blog", href: "/blog" }, { label: "Careers" }, { label: "Contact" }]
  },
  {
    title: "Resources",
    links: [
      { label: "Free Tools", href: "/free-tools" },
      { label: "Help Center" },
      { label: "API Docs", href: "/#docs" },
      { label: "Widget Guide", href: "/#how-it-works" },
      { label: "Security" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies" }
    ]
  }
] as const;

export function LandingFinalCtaFooter() {
  return (
    <section
      className="relative -mt-px overflow-hidden text-white"
      style={{
        backgroundColor: "#2563EB"
      }}
    >
      <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <section className="px-2 py-32 sm:py-36">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="display-font text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              Your next customer is on your site right now.
            </h2>
            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-blue-100/90">
              They have a question. Are you going to answer it?
            </p>
            <div className="mt-12 flex flex-col items-center gap-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-9 py-5 text-center text-lg font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Start chatting free
                <span aria-hidden="true">→</span>
              </Link>
              <p className="text-lg text-blue-100/85">Set up Chatting in 5 minutes. No credit card required.</p>
            </div>
          </div>
        </section>

        <footer id="footer" className="border-t border-white/15 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_repeat(4,minmax(0,0.7fr))]">
            <div className="max-w-sm">
              <p className="text-2xl font-semibold text-white">Chatting</p>
              <p className="mt-4 text-sm leading-7 text-blue-100/80">
                Warm, fast live chat for small teams who want conversations to feel human.
              </p>
            </div>

            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-white">{group.title}</p>
                <ul className="mt-4 space-y-3 text-sm text-blue-100/80">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {"href" in link ? (
                        <Link className="transition hover:text-white" href={link.href}>
                          {link.label}
                        </Link>
                      ) : (
                        <span>{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-1 text-sm leading-6 text-blue-100/72">
            <p>Chatting by Regulus Framework Limited. All rights reserved.</p>
            <p>Registered in England and Wales. Company No. 16998528</p>
            <p>Registered office: 124-128 City Road, London, EC1V 2NX</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
