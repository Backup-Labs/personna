import { ChevronDown } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { SectionLabel } from "./primitives";

export function FaqSection() {
  const content = landingContent.faq;
  return <section id="faq" className="landing-band">
    <div className="landing-section landing-container landing-faq" aria-labelledby="faq-title">
      <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="faq-title">{content.title}</h2></div>
      <div className="landing-faq-list">{content.items.map((item, index) => <details key={item.question} className="landing-faq-item"><summary><span className="landing-faq-number">0{index + 1}</span>{item.question}<ChevronDown size={13}/></summary><p>{item.answer}</p></details>)}</div>
    </div>
  </section>;
}
