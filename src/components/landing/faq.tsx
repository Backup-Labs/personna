import { ChevronDown } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { pricing } from "@/content/pricing";
import { SectionLabel } from "./primitives";

export function FaqSection() {
  const content = landingContent.faq;
  const pricingItems = pricing.faq.filter(item => {
    if (!("requires" in item)) return true;
    if (item.requires === "pauseEnabled") return pricing.pauseEnabled;
    if (item.requires === "trialDays") return pricing.trialDays > 0;
    return pricing.moneyBackDays > 0;
  });
  const items = [...content.items, ...pricingItems];
  return <section id="faq" className="landing-band">
    <div className="landing-section landing-container landing-faq" aria-labelledby="faq-title">
      <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="faq-title">{content.title}</h2></div>
      <div className="landing-faq-list">{items.map((item, index) => <details key={item.question} className="landing-faq-item"><summary><span className="landing-faq-number">{String(index + 1).padStart(2, "0")}</span>{item.question}<ChevronDown size={13}/></summary><p>{item.answer}</p></details>)}</div>
    </div>
  </section>;
}
