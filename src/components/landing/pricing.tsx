import { Check } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { GlowOrb, SectionLabel } from "./primitives";
import { PricingWidget } from "./pricing-widget";

export function PricingSection() {
  const content = landingContent.pricing;
  return <section id="pricing" className="landing-section landing-container relative" aria-labelledby="pricing-title">
    <GlowOrb className="landing-pricing-orb"/>
    <div className="landing-section-heading landing-pricing-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="pricing-title">{content.title}</h2></div>
    <PricingWidget content={content}/>
    <p className="landing-pricing-student">{content.studentDiscount}</p>
    <p className="landing-pricing-note">{content.note} {content.currencyNote}</p>
    <details className="landing-comparison"><summary>{content.compareLabel}</summary><div className="landing-table-wrap"><table><thead><tr><th scope="col">{content.includedLabel}</th>{content.comparisonHeadings.map(heading => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>{content.comparison.map(row => <tr key={row.feature}><th scope="row">{row.feature}</th>{([row.starter, row.pro, row.studio] as const).map((value, index) => <td key={index}>{typeof value === "boolean" ? value ? <Check size={15} aria-label={content.includedLabel}/> : <span aria-label={landingContent.ui.unavailable}>{landingContent.ui.notIncludedSymbol}</span> : value}</td>)}</tr>)}</tbody></table></div></details>
  </section>;
}
