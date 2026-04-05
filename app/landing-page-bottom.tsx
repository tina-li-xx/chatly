import { LandingConversionSections } from "./landing-page-conversion-sections";
import { LandingCoreFeaturesSection } from "./landing-page-core-features-section";
import { LandingFinalCtaFooter } from "./landing-page-final-cta-footer";
import { LandingComparisonSection, LandingProofSections } from "./landing-page-proof-sections";

export function LandingBottomSections() {
  return (
    <>
      <LandingCoreFeaturesSection />
      <LandingProofSections />
      <LandingConversionSections />
      <LandingComparisonSection />
      <LandingFinalCtaFooter />
    </>
  );
}
