import { Check, CircleDollarSign, Flag, Target } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { ProgressBar, ProgressRing, SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

export function ProgressShowcase() {
  const content = landingContent.progress;
  return <section className="landing-band">
    <div className="landing-section landing-container" aria-labelledby="progress-title">
      <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="progress-title">{content.title}</h2></div>
      <div className="landing-grid landing-grid-three">
        <Reveal><article className="landing-progress-card"><div className="landing-progress-card-heading"><span className="landing-icon-tile"><Flag size={17}/></span><span>{content.goalLabel}</span></div><h3>{content.goal.title}</h3><p>{content.goal.detail}</p><ProgressBar value={content.goal.value} label={content.goal.title}/><div className="landing-segments" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index} className={index < 4 ? "is-filled" : ""}/>)}</div></article></Reveal>
        <Reveal delay={50}><article className="landing-progress-card landing-savings-card"><div><div className="landing-progress-card-heading"><span className="landing-icon-tile"><CircleDollarSign size={17}/></span><span>{content.savingsLabel}</span></div><h3>{content.savings.title}</h3><p>{content.savings.detail}</p></div><div className="landing-savings-bottom"><ProgressRing value={content.savings.value} label={content.savings.title}/><span><strong>{content.savings.value}%</strong><small>{content.savings.runway}</small></span></div></article></Reveal>
        <Reveal delay={100}><article className="landing-progress-card"><div className="landing-progress-card-heading"><span className="landing-icon-tile"><Target size={17}/></span><span>{content.habitLabel}</span></div><h3>{content.habit.title}</h3><p>{content.habit.detail}</p><div className="landing-habit-week" aria-label={content.habitWeek}>{content.habit.days.map((day, index) => <span key={index} className={`landing-habit-day landing-habit-${day}`} aria-hidden="true">{day === "done" ? <Check size={12}/> : day === "skip" ? <span/> : null}</span>)}</div><div className="landing-habit-labels">{content.weekDays.map((day, index) => <span key={index}>{day}</span>)}</div></article></Reveal>
      </div>
    </div>
  </section>;
}
