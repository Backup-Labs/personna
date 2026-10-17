import Image from "next/image";
import { ArrowDown, Check } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { Chip, GlowOrb } from "./primitives";
import { LandingButton, StartFreeLink } from "./cta";

export function HeroSection() {
  const hero = landingContent.hero;
  return <section className="landing-hero landing-container relative" aria-labelledby="hero-heading">
    <GlowOrb className="landing-hero-orb"/><div aria-hidden="true" className="landing-glow-orb landing-hero-orb landing-hero-orb-blue"/>
    <div className="landing-hero-copy">
      <Chip><span className="landing-live-dot"/>{hero.eyebrow}</Chip>
      <h1 id="hero-heading">{hero.title.split(" from one operating system")[0]}<br/><span className="landing-gradient-text">from one operating system.</span></h1>
      <p className="landing-hero-description">{hero.description}</p>
      <div className="landing-hero-actions"><StartFreeLink/><LandingButton href="#workflow" variant="secondary">See how it works <ArrowDown size={16}/></LandingButton></div>
      <div className="landing-hero-proof"><p className="landing-hero-note">{hero.note}</p><div className="landing-trust-row">{hero.trust.map(item => <span key={item}><Check size={14}/>{item}</span>)}</div></div>
    </div>
    <div className="landing-dashboard-wrap">
      <div className="landing-dashboard-glow" aria-hidden="true"/>
      <figure className="landing-dashboard-preview">
        <Image src="/personna-dashboard-preview.png" alt="Personna dashboard showing the daily focus, due tasks, and weekly progress views" width={1365} height={681} priority sizes="(max-width: 1000px) 100vw, 56vw" />
        <figcaption>{hero.sampleLabel}</figcaption>
      </figure>
      <div className="landing-preview-caption"><span className="landing-live-dot"/>One connected workspace<span>Tasks · projects · money · goals</span></div>
    </div>
  </section>;
}
