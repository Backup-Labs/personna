"use client";

import { Check, Sparkles } from "@/components/ui/icons";
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

  return <>
    <div className="landing-billing-toggle" role="group" aria-label={landingContent.ui.chooseBilling}>
      <button type="button" aria-pressed={billing === "monthly"} onClick={() => chooseBilling("monthly")}>{content.monthlyLabel}</button>
      <button type="button" aria-pressed={billing === "annual"} onClick={() => chooseBilling("annual")}>{content.annualLabel}</button>
    </div>
    <div className="landing-pricing-grid">{content.plans.map(plan => {
      const price = billing === "annual" ? plan.annual : plan.monthly;
      const priceText = plan.id === "starter" ? landingContent.ui.free : `$${Number.isInteger(price) ? price : price.toFixed(2)}`;
      return <article key={plan.id} className={`landing-plan-card ${plan.featured ? "landing-plan-featured" : ""}`}>
        {plan.badge && <span className="landing-plan-badge"><Sparkles size={12}/>{plan.badge}</span>}
        <p className="landing-plan-name">{plan.name}</p><p className="landing-plan-description">{plan.description}</p>
        <div className="landing-plan-price" aria-live="polite"><strong>{priceText}</strong>{plan.id !== "starter" && <span>{landingContent.ui.perMonth}{billing === "annual" ? ` · $${plan.annualTotal} ${landingContent.ui.billedYearlySuffix}` : ""}</span>}</div>
        <p className="landing-plan-local">{plan.local}</p><p className="landing-plan-audience">{plan.audience}</p>
        <LandingButton href={planHref(plan.id, billing)} variant={plan.featured ? "primary" : "secondary"} className="w-full" onClick={() => trackLandingEvent("pricing_cta_click", { plan: plan.id, billing })}>{plan.cta}</LandingButton>
        <ul className="landing-plan-features">{plan.features.map(feature => <li key={feature}><Check size={14}/>{feature}</li>)}</ul>
      </article>;
    })}</div>
  </>;
}
