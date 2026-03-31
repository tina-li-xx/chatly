import { stats, testimonials } from "./landing-page-data";
import { SectionLabel } from "./landing-page-primitives";

export function LandingProofSections() {
  return (
    <>
      <section className="bg-blue-600">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 px-2 text-white sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label}>
                <div className="text-4xl font-semibold tracking-tight">{item.value}</div>
                <p className="mt-2 text-sm text-blue-100">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFFBF5]">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
          <section id="testimonials" className="px-2">
            <div className="max-w-4xl">
              <SectionLabel>Testimonials</SectionLabel>
              <h2 className="display-font mt-5 text-4xl text-slate-900 sm:text-5xl lg:whitespace-nowrap">
                Teams who switched never looked back
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="hover-lift rounded-[28px] border border-slate-200/80 bg-white/90 p-7"
                >
                  <p className="text-base leading-8 text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {testimonial.initials}
                    </div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
