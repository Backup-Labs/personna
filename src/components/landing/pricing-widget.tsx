"use client";

import { Check } from "@/components/ui/icons";
import { useState } from "react";
import { pricing, type BillingPeriod } from "@/content/pricing";
import { trackLandingEvent } from "./analytics";
import { LandingButton } from "./cta";

function planHref(plan: string, billing: BillingPeriod) {
  return plan === "starter" ? "/signup?plan=starter" : `/signup?plan=${plan}&billing=${billing}`;
}

export function PricingWidget() {
  const [billing, setBilling] = useState<BillingPeriod>(pricing.defaultBilling);
  function chooseBilling(next: BillingPeriod) {
    setBilling(next);
    trackLandingEvent("pricing_billing_toggle", { billing: next });
  }

  return <div className="landing-pricing-layout">
    <aside className="landing-pricing-aside">
      <span className="landing-pricing-aside-number">01 <i/> 04</span>
      <h3>Choose the room you need.</h3>
      <p>{pricing.description}</p>
      <div className="landing-pricing-switch-wrap">
        <span>Billing frequency</span>
        <div className="landing-billing-toggle" role="group" aria-label="Choose billing frequency">
          <button type="button" aria-pressed={billing === "monthly"} onClick={() => chooseBilling("monthly")}>{pricing.monthlyLabel}</button>
          <button type="button" aria-pressed={billing === "annual"} onClick={() => chooseBilling("annual")}>{pricing.annualLabel} <span className="landing-plan-row-badge">{pricing.annualBadge}</span></button>
        </div>
      </div>
    </aside>
    <div className="landing-plan-list">
      {pricing.plans.map((plan, index) => {
        const amount = billing === "annual" ? plan.annualTotal : plan.monthly;
        const amountText = `$${amount.toFixed(0)}`;
        const period = plan.id === "starter" ? "forever" : billing === "annual" ? "per year" : "per month";
        const annualSavings = plan.monthly * 12 - plan.annualTotal;
        return <article key={plan.id} className={`landing-plan-row ${plan.featured ? "landing-plan-row-featured" : ""}`}>
          <div className="landing-plan-row-info"><span className="landing-plan-row-index">0{index + 1}</span><div><div className="landing-plan-row-title"><h3>{plan.name}</h3>{plan.badge && <span className="landing-plan-row-badge">{plan.badge}</span>}</div><p>{plan.tagline}</p></div></div>
          <div><ul className="landing-plan-row-features">{plan.features.map(feature => <li key={feature}><Check size={12}/>{feature}</li>)}</ul>{"valueNote" in plan && <p className="landing-plan-value-note">{plan.valueNote}</p>}</div>
          <div className="landing-plan-row-action"><p className="landing-plan-row-price" aria-live="polite"><strong>{amountText}</strong><span>{period}</span></p>{billing === "annual" && plan.id !== "starter" && <small className="landing-plan-row-yearly">${plan.annualTotal} billed yearly · save ${annualSavings}</small>}<LandingButton href={planHref(plan.id, billing)} variant={plan.featured ? "primary" : "secondary"} className="w-full" onClick={() => trackLandingEvent("pricing_cta_click", { plan: plan.id, billing })}>{plan.cta}</LandingButton></div>
        </article>;
      })}
      <article className="landing-plan-row">
        <div className="landing-plan-row-info"><span className="landing-plan-row-index">04</span><div><div className="landing-plan-row-title"><h3>{pricing.business.name}</h3><span className="landing-plan-row-badge">{pricing.businessAvailable ? "Available" : pricing.business.badge}</span></div><p>{pricing.business.tagline}</p></div></div>
        <ul className="landing-plan-row-features">{pricing.business.features.map(feature => <li key={feature}><Check size={12}/>{feature}</li>)}</ul>
        <div className="landing-plan-row-action"><p className="landing-plan-row-price"><strong>${pricing.business.monthly}</strong><span>per month</span></p>{pricing.businessAvailable ? <LandingButton href="/signup?plan=business" variant="primary" className="w-full" onClick={() => trackLandingEvent("pricing_cta_click", { plan: "business", billing })}>Get Business</LandingButton> : <a href="#business-waitlist" className="landing-button landing-button-secondary w-full" onClick={() => trackLandingEvent("pricing_cta_click", { plan: "business", billing })}>Join the waitlist</a>}</div>
      </article>
    </div>
  </div>;
}
