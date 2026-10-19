import { CircleDollarSign, Flag, Target } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

export function ProgressShowcase() {
  const content = landingContent.progress;
  return <section className="landing-band">
    <div className="landing-section landing-container" aria-labelledby="progress-title">
      <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="progress-title">Build momentum in a way that feels human.</h2></div>
      <div className="landing-growth-grid">
        <Reveal><article className="landing-growth-card"><span className="landing-icon-tile"><Flag size={17}/></span><p className="landing-growth-label">{content.goalLabel}</p><h3>{content.goal.title}</h3><p>{content.goal.detail}</p><div className="landing-growth-note"><span>Next step</span><strong>Choose one milestone to move forward</strong></div></article></Reveal>
        <Reveal delay={50}><article className="landing-growth-card"><span className="landing-icon-tile"><CircleDollarSign size={17}/></span><p className="landing-growth-label">{content.savingsLabel}</p><h3>{content.savings.title}</h3><p>{content.savings.detail}</p><div className="landing-growth-note"><span>In view</span><strong>{content.savings.runway}</strong></div></article></Reveal>
        <Reveal delay={100}><article className="landing-growth-card"><span className="landing-icon-tile"><Target size={17}/></span><p className="landing-growth-label">{content.habitLabel}</p><h3>{content.habit.title}</h3><p>{content.habit.detail}</p><div className="landing-growth-note"><span>A gentle reminder</span><strong>Pick up again whenever you are ready</strong></div></article></Reveal>
      </div>
    </div>
  </section>;
}
