import Image from "next/image";
import { ArrowDown, ArrowRight, BookOpen, CalendarClock, Check, CircleDollarSign, FolderKanban, Sparkles, Target } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { Chip, GlowOrb } from "./primitives";
import { LandingButton, StartFreeLink } from "./cta";

const orbitModules = [
  { label: "Projects", icon: FolderKanban, className: "is-projects" },
  { label: "Money", icon: CircleDollarSign, className: "is-money" },
  { label: "Learning", icon: BookOpen, className: "is-learning" },
  { label: "Goals", icon: Target, className: "is-goals" },
];

export function HeroSection() {
  const hero = landingContent.hero;
  const firstLine = hero.title.split(" from one operating system")[0];
  return <section className="landing-hero landing-container relative" aria-labelledby="hero-heading">
    <GlowOrb className="landing-hero-orb"/><div aria-hidden="true" className="landing-glow-orb landing-hero-orb landing-hero-orb-blue"/>
    <div className="landing-hero-top">
      <div className="landing-hero-copy">
        <Chip><span className="landing-live-dot"/>{hero.eyebrow}</Chip>
        <h1 id="hero-heading">{firstLine}<span className="landing-gradient-text"> from one operating system.</span></h1>
        <p className="landing-hero-description">{hero.description}</p>
        <div className="landing-hero-actions"><StartFreeLink>Build your workspace <ArrowRight size={16}/></StartFreeLink><LandingButton href="#modules" variant="secondary">Explore Personna <ArrowDown size={15}/></LandingButton></div>
        <div className="landing-hero-proof"><div className="landing-trust-row">{hero.trust.map(item => <span key={item}><Check size={14}/>{item}</span>)}</div><p className="landing-hero-note">{hero.note}</p></div>
      </div>
      <div className="landing-hero-art" aria-hidden="true">
        <div className="landing-art-grid"/>
        <svg className="landing-art-lines" viewBox="0 0 600 470" fill="none"><path d="M300 232 126 112M300 232 478 102M300 232 116 356M300 232 484 352"/><circle cx="300" cy="232" r="150"/><circle cx="300" cy="232" r="215"/></svg>
        <div className="landing-art-core"><span className="landing-art-core-glow"/><span className="landing-art-core-icon"><Sparkles size={27}/></span><strong>personna<span>.</span></strong><small>YOUR LIFE, CONNECTED</small></div>
        {orbitModules.map(({ label, icon: Icon, className }) => <div key={label} className={`landing-art-module ${className}`}><span><Icon size={16}/></span>{label}</div>)}
        <div className="landing-art-plan"><span className="landing-art-plan-icon"><CalendarClock size={15}/></span><div><small>UP NEXT</small><strong>Make room for focus</strong></div><span className="landing-art-plan-check"><Check size={12}/></span></div>
        <div className="landing-art-balance"><span className="landing-art-balance-icon"><CircleDollarSign size={17}/></span><div><small>MONTHLY BUDGET</small><strong>On track <i/></strong></div></div>
      </div>
    </div>
    <div className="landing-dashboard-wrap">
      <div className="landing-dashboard-glow" aria-hidden="true"/>
      <figure className="landing-dashboard-preview">
        <Image src="/upscalemedia-transformed.png" alt="Personna dashboard showing an overview of a personal workspace" width={2730} height={1362} priority sizes="(max-width: 767px) 100vw, (max-width: 1200px) 92vw, 1200px" unoptimized />
        <figcaption>{hero.sampleLabel}</figcaption>
      </figure>
      <div className="landing-preview-caption"><span className="landing-live-dot"/>One connected workspace<span>Tasks · projects · money · goals</span></div>
    </div>
  </section>;
}
