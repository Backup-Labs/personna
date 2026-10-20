import { pricing } from "@/content/pricing";
import { GlowOrb, SectionLabel } from "./primitives";
import { PricingWidget } from "./pricing-widget";
import { PlanComparison } from "./plan-comparison";
import { BusinessWaitlistForm } from "./waitlist-form";

export function PricingSection() {
  return <section id="pricing" className="landing-section landing-container relative" aria-labelledby="pricing-title">
    <GlowOrb className="landing-pricing-orb"/>
    <div className="landing-section-heading landing-pricing-heading"><SectionLabel>{pricing.eyebrow}</SectionLabel><h2 id="pricing-title">{pricing.title}</h2><p>{pricing.description}</p></div>
    <PricingWidget/>
    <div className="landing-pricing-trust" aria-label="Plan details">
      {pricing.trialDays > 0 && <span>{pricing.trialDays}-day Studio trial, no card required</span>}
      {pricing.moneyBackDays > 0 && <span>{pricing.moneyBackDays}-day money-back guarantee</span>}
      {pricing.pauseEnabled && <span>Cancel or pause anytime</span>}
      {pricing.cardEnabled && <span>Pay by card</span>}
      {pricing.trust.exportEveryPlan && <span>Export your data on every plan</span>}
    </div>
    <p className="landing-pricing-student">{pricing.studentNote}</p>
    <p className="landing-pricing-student">{pricing.schoolsNote}</p>
    <p className="landing-pricing-note">{pricing.footnote}</p>
    <PlanComparison/>
    {!pricing.businessAvailable && <div className="landing-waitlist"><div><h3>Get updates on Personna Business</h3><p>Leave your details and we’ll let you know when the team plan is ready.</p></div><BusinessWaitlistForm/></div>}
  </section>;
}
