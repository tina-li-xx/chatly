import { SectionLabel } from "./landing-page-primitives";
import { LandingOtherFeaturesSection } from "./landing-page-other-features-section";

const comparisonRows = [
  {
    label: "Starting price",
    values: ["Free", "$74/seat/mo", '"Free" (requires CRM)', "Free"]
  },
  {
    label: "Unlimited chats",
    values: ["$20/mo", "$74+/mo", "Paid plans", "$25/mo"]
  },
  {
    label: "Setup time",
    values: ["3 min", "30+ min", "30+ min", "15 min"]
  },
  {
    label: "Per-seat pricing",
    values: ["No (up to 3)", "Yes", "Yes", "Yes"]
  },
  {
    label: "Built for",
    values: ["Small teams", "Enterprises", "HubSpot users", "Everyone"]
  },
  {
    label: "Complexity",
    values: ["Simple", "Complex", "Complex", "Medium"]
  }
] as const;

export function LandingProofSections() {
  return (
    <>
      <LandingOtherFeaturesSection />
    </>
  );
}

export function LandingComparisonSection() {
  return (
    <section className="bg-[#FFFDF9]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-4xl px-2">
          <SectionLabel>Why small teams pick Chatting</SectionLabel>
          <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl">Built for small teams. Not stripped-down enterprise software.</h2>
        </div>
        <div className="mt-12 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-6 py-5 text-left text-sm font-semibold text-slate-500"> </th>
                  {["Chatting", "Intercom", "HubSpot Chat", "Crisp"].map((name, index) => (
                    <th
                      key={name}
                      className={`px-6 py-5 text-left text-sm font-semibold ${index === 0 ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, rowIndex) => (
                  <tr key={`comparison-row-${rowIndex}`} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-6 py-5 text-sm font-medium text-slate-900">{row.label}</td>
                    {row.values.map((value, index) => (
                      <td
                        key={`comparison-cell-${rowIndex}-${index}`}
                        className={`px-6 py-5 text-sm leading-7 ${index === 0 ? "bg-blue-50/70 font-semibold text-slate-900" : "text-slate-600"}`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-4xl px-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">The bottom line</p>
          <p className="mt-4 text-lg leading-8 text-slate-700">Intercom is built for enterprise teams with enterprise budgets. HubSpot locks you into their ecosystem. Crisp is solid, but gets expensive as your team grows.</p>
          <p className="mt-4 text-lg font-medium leading-8 text-slate-900">Chatting gives you what you actually need — at a price that makes sense.</p>
        </div>
      </div>
    </section>
  );
}
