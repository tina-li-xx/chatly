const trustCategories = [
  "SaaS teams",
  "Agencies",
  "Ecommerce",
  "Consultants",
  "Studios",
  "Startups"
] as const;

export function LandingHeroLogoStrip() {
  return (
    <div className="mt-8">
      <div className="rounded-[22px] border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Trusted by small teams across
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-slate-500">
          {trustCategories.map((item, index) => (
          <span
            key={item}
            className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 ${
              index % 2 === 0 ? "font-semibold text-slate-700" : "font-medium text-slate-500"
            }`}
          >
            {item}
          </span>
          ))}
        </div>
      </div>
    </div>
  );
}
