import { landingContent } from "@/content/landing";
import { FeatureCard, SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

export function ModulesSection() {
  const content = landingContent.modules;
  return <section id="modules" className="landing-section landing-container" aria-labelledby="modules-title">
    <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="modules-title">{content.title}</h2></div>
    <div className="landing-grid landing-grid-four">{content.items.map((item, index) => <Reveal key={item.number} delay={(index % 4) * 45}><FeatureCard number={item.number} icon={item.icon} title={item.name} featured={item.icon === "ai"}>{item.benefit}</FeatureCard></Reveal>)}</div>
  </section>;
}
