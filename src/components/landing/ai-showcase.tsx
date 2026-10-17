import { Bot, Check, ShieldCheck, Sparkles } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { CheckList, Chip, SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

export function AiShowcase() {
  const content = landingContent.ai;
  return <section id="ai" className="landing-section landing-container landing-showcase" aria-labelledby="ai-title">
    <Reveal className="landing-showcase-copy"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="ai-title">{content.title}</h2><CheckList items={content.bullets}/></Reveal>
    <Reveal className="landing-illustration-wrap"><div className="landing-ai-card">
      <header><span className="landing-icon-tile"><Bot size={18}/></span><div><strong>{content.assistantName}</strong><small>{content.assistantScope}</small></div><ShieldCheck size={17} className="ml-auto text-[var(--success)]"/></header>
      <div className="landing-chat-user">{content.question}</div>
      <div className="landing-chat-response"><span className="landing-ai-avatar"><Sparkles size={14}/></span><p>{content.answer}</p></div>
      <div className="landing-proposal"><div className="landing-proposal-label"><Sparkles size={13}/>{content.proposalLabel}</div><strong>{content.proposal}</strong><div className="flex gap-2"><Chip className="landing-chip-success"><Check size={12}/>{content.accept}</Chip><Chip>{content.dismiss}</Chip></div></div>
      <p className="landing-chat-foot"><ShieldCheck size={13}/>{content.userControl}</p>
    </div></Reveal>
  </section>;
}
