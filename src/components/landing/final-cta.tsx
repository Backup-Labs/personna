import { ArrowRight } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { GlowOrb } from "./primitives";
import { StartFreeLink } from "./cta";

export function FinalCta() {
  return <section className="landing-container landing-final-wrap" aria-labelledby="final-cta-title">
    <div className="landing-final-card"><GlowOrb className="landing-final-orb"/><p className="landing-eyebrow"><span aria-hidden="true"/>YOUR NEXT CHAPTER</p><h2 id="final-cta-title">{landingContent.final.title}</h2><p>{landingContent.final.description}</p><StartFreeLink>Start free <ArrowRight size={16}/></StartFreeLink></div>
  </section>;
}
