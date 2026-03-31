import { LandingBottomSections } from "./landing-page-bottom";
import { LandingHeader } from "./landing-page-primitives";
import { LandingTopSections } from "./landing-page-top";

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden bg-white text-slate-900">
      <LandingHeader />
      <LandingTopSections />
      <LandingBottomSections />
    </main>
  );
}
