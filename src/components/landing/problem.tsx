import { landingContent } from "@/content/landing";
import { FeatureCard, SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

const icons = ["dashboard", "finance", "projects", "growth"];

export function ProblemSection() {
  const content = landingContent.problem;
  return <section id="problem" className="landing-section landing-container" aria-labelledby="problem-title">
    <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="problem-title">{content.title}</h2></div>
    <div className="landing-grid landing-grid-four">{content.cards.map((card, index) => <Reveal key={card.title} delay={index * 45}><FeatureCard icon={icons[index]} title={card.title}>{card.text}</FeatureCard></Reveal>)}</div>
    <p className="landing-bridge">{content.bridge}</p>
  </section>;
}
