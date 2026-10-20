export type BillingPeriod = "monthly" | "annual";

export const pricing = {
  currency: "USD",
  eyebrow: "Pricing",
  title: "Simple pricing. Start free, upgrade when it pays off.",
  description: "Start free. Upgrade when Personna saves you more than it costs.",
  monthlyLabel: "Monthly",
  annualLabel: "Annual",
  annualBadge: "2 months free",
  defaultBilling: "annual" as BillingPeriod,
  // Keep these claims disabled until billing and support policies are live.
  trialDays: 0,
  moneyBackDays: 0,
  pauseEnabled: false,
  cardEnabled: false,
  businessAvailable: false,
  founders: { enabled: false },
  plans: [
    {
      id: "starter", name: "Starter", tagline: "For getting organized.", badge: "", monthly: 0, annualTotal: 0,
      cta: "Start free", featured: false,
      features: ["Tasks, notes, and habits", "Up to 3 active projects", "Up to 2 finance accounts", "Manual transaction entry", "90 days of history", "MoMo and Airtel SMS import (up to 20 transactions)", "10 AI messages per month", "One AI weekly debrief", "Full data export"],
    },
    {
      id: "pro", name: "Pro", tagline: "For individuals who want it automated.", badge: "Most popular", monthly: 7, annualTotal: 70,
      cta: "Go Pro", featured: true,
      features: ["Everything in Starter", "Unlimited projects, accounts, and history", "Unlimited MoMo and Airtel SMS import", "Time blocking, timer, and planned-vs-actual reports", "AI assistant (100 messages per month)", "AI weekly debrief every week", "Automatic backups"],
    },
    {
      id: "studio", name: "Studio", tagline: "For freelancers who want to know what their work earns.", badge: "", monthly: 19, annualTotal: 190,
      cta: "Go Studio", featured: false,
      features: ["Everything in Pro", "Project profitability and effective hourly rate", "Invoices and client tracking", "Multi-currency reports", "AI assistant (400 messages per month)", "Priority support"],
      valueNote: "One dropped low-paying client can pay for a year of Studio.",
    },
  ],
  business: {
    id: "business", name: "Business", monthly: 29, tagline: "For shops and small teams.", badge: "Coming soon",
    features: ["3 team seats", "MoMo reconciliation", "Sales and expense tracking", "Receipts"],
  },
  comparisonGroups: [
    { name: "Projects", rows: [
      { feature: "Active projects", starter: "Up to 3", pro: "Unlimited", studio: "Unlimited" },
      { feature: "Project profitability and hourly rate", starter: false, pro: false, studio: true },
      { feature: "Invoices and client tracking", starter: false, pro: false, studio: true },
    ] },
    { name: "Finance", rows: [
      { feature: "Finance accounts", starter: "Up to 2", pro: "Unlimited", studio: "Unlimited" },
      { feature: "Manual transaction entry", starter: true, pro: true, studio: true },
      { feature: "MoMo and Airtel SMS imports", starter: "20 transactions", pro: "Unlimited", studio: "Unlimited" },
      { feature: "Multi-currency reports", starter: false, pro: false, studio: true },
    ] },
    { name: "Time", rows: [
      { feature: "Time blocking and focus timer", starter: false, pro: true, studio: true },
      { feature: "Planned vs actual reports", starter: false, pro: true, studio: true },
    ] },
    { name: "AI", rows: [
      { feature: "AI messages per month", starter: "10", pro: "100", studio: "400" },
      { feature: "AI weekly debrief", starter: "One", pro: "Every week", studio: "Every week" },
    ] },
    { name: "Support", rows: [
      { feature: "Priority support", starter: false, pro: false, studio: true },
    ] },
    { name: "Data", rows: [
      { feature: "History", starter: "90 days", pro: "Unlimited", studio: "Unlimited" },
      { feature: "Full data export", starter: true, pro: true, studio: true },
      { feature: "Automatic backups", starter: false, pro: true, studio: true },
    ] },
  ],
  comparisonHeadings: ["Starter", "Pro", "Studio"],
  compareLabel: "Compare plans",
  includedLabel: "Feature",
  includedValueLabel: "Included",
  unavailableLabel: "Not included",
  unavailableSymbol: "—",
  trust: {
    cancelAnytime: false,
    exportEveryPlan: true,
  },
  studentNote: "Students get 50% off Pro with a valid school email.",
  schoolsNote: "Schools and bootcamps: seat pricing for groups of 25 or more. Contact us.",
  footnote: "Prices in US dollars. Taxes may apply depending on your country. Paid checkout is not live yet.",
  businessTypes: ["Retail shop", "Freelancer", "Service business", "Other"] as const,
  faq: [
    { question: "What happens when I hit a Starter limit?", answer: "Nothing is deleted. You can still view and export everything; adding more requires upgrading." },
    { question: "Can I pause instead of cancelling?", answer: "Yes, for up to 3 months. Your data is kept.", requires: "pauseEnabled" as const },
    { question: "What if I downgrade?", answer: "Your data is kept and exportable. Anything above the lower plan's limits becomes read-only." },
    { question: "Is there a free trial?", answer: "Studio has a 14-day trial with no card required.", requires: "trialDays" as const },
    { question: "What does the money-back guarantee cover?", answer: "Any paid plan, within 30 days of your first payment.", requires: "moneyBackDays" as const },
    { question: "Do you offer student pricing?", answer: "Yes, 50% off Pro with a valid school email." },
  ],
} as const;

export type PlanId = (typeof pricing.plans)[number]["id"];
