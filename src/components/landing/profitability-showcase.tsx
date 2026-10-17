import { ArrowUpRight, BriefcaseBusiness } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { ProgressBar, SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

export function ProfitabilityShowcase() {
  const content = landingContent.profitability;
  return <section className="landing-band">
    <div className="landing-section landing-container landing-showcase landing-showcase-reverse" aria-labelledby="profitability-title">
      <Reveal className="landing-showcase-copy"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="profitability-title">{content.title}</h2><p>{content.description}</p><a href="/signup" className="landing-inline-link">{content.link} <ArrowUpRight size={15}/></a></Reveal>
      <Reveal className="landing-illustration-wrap"><div className="landing-rate-card"><header><span className="landing-icon-tile"><BriefcaseBusiness size={18}/></span><div><small>{content.cardLabel}</small><h3>{content.cardTitle}</h3></div><span className="landing-card-period">{content.period}</span></header><div className="landing-rate-bars">{content.bars.map(bar => <div className="landing-rate-row" key={bar.label}><div className="flex items-center justify-between gap-3"><span>{bar.label}</span><strong>{bar.rate}</strong></div><ProgressBar value={bar.value} tone={bar.tone === "warning" ? "warning" : "accent"} label={bar.label}/></div>)}</div><p className="landing-rate-note">{content.note}</p></div></Reveal>
    </div>
  </section>;
}
