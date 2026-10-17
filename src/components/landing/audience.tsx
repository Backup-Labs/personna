import { landingContent } from "@/content/landing";
import { FeatureCard, SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

export function AudienceSection() {
  const content = landingContent.audience;
  return <section className="landing-section landing-container" aria-labelledby="audience-title">
    <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="audience-title">{content.title}</h2></div>
    <div className="landing-grid landing-grid-four">{content.cards.map((card, index) => <Reveal key={card.title} delay={index * 45}><FeatureCard icon={card.icon} title={card.title}>{card.text}</FeatureCard></Reveal>)}</div>
  </section>;
}
