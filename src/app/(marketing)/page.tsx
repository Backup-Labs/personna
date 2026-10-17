import type { Metadata } from "next";
import { landingContent } from "@/content/landing";
import { LandingAnalytics } from "@/components/landing/analytics";
import { AiShowcase } from "@/components/landing/ai-showcase";
import { AudienceSection } from "@/components/landing/audience";
import { FaqSection } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero";
import { LandingNavbar } from "@/components/landing/navbar";
import { ModulesSection } from "@/components/landing/modules";
import { MomoShowcase } from "@/components/landing/momo-showcase";
import { PricingSection } from "@/components/landing/pricing";
import { ProblemSection } from "@/components/landing/problem";
import { ProgressShowcase } from "@/components/landing/progress-showcase";
import { ProfitabilityShowcase } from "@/components/landing/profitability-showcase";
import { WorkflowSection } from "@/components/landing/workflow";

export const metadata: Metadata = {
  title: landingContent.metadata.title,
  description: landingContent.metadata.description,
  openGraph: {
    type: "website",
    title: landingContent.metadata.title,
    description: landingContent.metadata.description,
    siteName: "Personna",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Personna — your whole life, in one system" }],
  },
  twitter: { card: "summary_large_image", title: landingContent.metadata.title, description: landingContent.metadata.description, images: ["/opengraph-image"] },
};

const softwareApplication = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Personna",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description: landingContent.metadata.description,
  offers: landingContent.pricing.plans.map(plan => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.annualTotal,
    priceCurrency: "USD",
    category: "Early access indicative pricing",
    availability: "https://schema.org/PreOrder",
  })),
};

export default function MarketingPage() {
  return <div id="top" className="landing-page">
    <LandingNavbar/>
    <main id="main-content">
      <HeroSection/><ProblemSection/><ModulesSection/><WorkflowSection/><MomoShowcase/><ProfitabilityShowcase/><AiShowcase/><ProgressShowcase/><AudienceSection/><PricingSection/><FaqSection/><FinalCta/>
    </main>
    <LandingFooter/><LandingAnalytics/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication).replace(/</g, "\\u003c") }}/>
  </div>;
}
