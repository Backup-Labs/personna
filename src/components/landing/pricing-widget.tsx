"use client";

import { Check } from "@/components/ui/icons";
import { useState } from "react";
import { landingContent, type BillingPeriod } from "@/content/landing";
import { trackLandingEvent } from "./analytics";
import { LandingButton } from "./cta";

function planHref(plan: string, billing: BillingPeriod) {
  return `/signup?plan=${plan}&billing=${billing}`;
}

export function PricingWidget({ content }: { content: typeof landingContent.pricing }) {
  const [billing, setBilling] = useState<BillingPeriod>("annual");
  function chooseBilling(next: BillingPeriod) {
    setBilling(next);
    trackLandingEvent("billing_toggle", { billing: next });
  }

  return <div className="landing-pricing-layout">
    <aside className="landing-pricing-aside">
      <span className="landing-pricing-aside-number">01 <i/> 03</span>
      <h3>Grow into a system that fits.</h3>
      <p>Start with the essentials, then add more room as your work and routines evolve.</p>
      <div className="landing-pricing-switch-wrap">
        <span>Billing frequency</span>
        <div className="landing-billing-toggle" role="group" aria-label={landingContent.ui.chooseBilling}>
          <button type="button" aria-pressed={billing === "monthly"} onClick={() => chooseBilling("monthly")}>{content.monthlyLabel}</button>
          <button type="button" aria-pressed={billing === "annual"} onClick={() => chooseBilling("annual")}>{content.annualLabel}</button>
        </div>
      </div>
    </aside>
    <div className="landing-plan-list">{content.plans.map((plan, index) => {
      const price = billing === "annual" ? plan.annual : plan.monthly;
      const priceText = plan.id === "starter" ? landingContent.ui.free : `$${Number.isInteger(price) ? price : price.toFixed(2)}`;
      return <article key={plan.id} className={`landing-plan-row ${plan.featured ? "landing-plan-row-featured" : ""}`}>
        <div className="landing-plan-row-info"><span className="landing-plan-row-index">0{index + 1}</span><div><div className="landing-plan-row-title"><h3>{plan.name}</h3>{plan.badge && <span className="landing-plan-row-badge">{plan.badge}</span>}</div><p>{plan.description}</p><small>{plan.audience}</small></div></div>
        <ul className="landing-plan-row-features">{plan.features.map(feature => <li key={feature}><Check size={12}/>{feature}</li>)}</ul>
        <div className="landing-plan-row-action"><p className="landing-plan-row-price" aria-live="polite"><strong>{priceText}</strong>{plan.id !== "starter" && <span>{landingContent.ui.perMonth}</span>}</p>{plan.id !== "starter" && billing === "annual" && <small className="landing-plan-row-yearly">${plan.annualTotal} billed yearly</small>}<span className="landing-plan-row-local">{plan.local}</span><LandingButton href={planHref(plan.id, billing)} variant={plan.featured ? "primary" : "secondary"} className="w-full" onClick={() => trackLandingEvent("pricing_cta_click", { plan: plan.id, billing })}>{plan.cta}</LandingButton></div>
      </article>;
    })}</div>
  </div>;
}
