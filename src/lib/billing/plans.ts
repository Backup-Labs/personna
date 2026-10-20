import { pricing, type BillingPeriod, type PlanId } from "@/content/pricing";

export const BILLING_PLANS = Object.fromEntries(pricing.plans.map(plan => [plan.id, {
  id: plan.id,
  monthlyUsd: plan.monthly,
  annualUsd: plan.annualTotal,
}])) as Record<PlanId, { id: PlanId; monthlyUsd: number; annualUsd: number }>;

/**
 * Payment provider integration is intentionally deferred. Callers must handle
 * null and keep the signup flow available until a real checkout is configured.
 */
export function getCheckoutUrl(plan: PlanId, billing: BillingPeriod): string | null {
  void plan;
  void billing;
  return null;
}
