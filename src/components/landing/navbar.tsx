import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { landingContent } from "@/content/landing";
import { StartFreeLink } from "./cta";

export function LandingNavbar() {
  return <header className="landing-navbar">
    <div className="landing-container">
      <div className="landing-navbar-main">
        <Link href="/" aria-label={landingContent.ui.brandAria} className="landing-brand"><BrandMark size="small"/>{landingContent.ui.brand}</Link>
        <nav aria-label={landingContent.ui.mainNavigation} className="landing-nav-desktop">{landingContent.nav.map(item => <a key={item.href} href={item.href} className="landing-nav-link">{item.label}</a>)}</nav>
        <div className="landing-nav-actions"><Link className="landing-nav-link" href="/login">{landingContent.ui.signIn}</Link><StartFreeLink className="landing-button-small"/></div>
      </div>
      <nav aria-label={landingContent.ui.mobileNavigation} className="landing-nav-mobile">{landingContent.nav.map(item => <a key={item.href} href={item.href} className="landing-nav-mobile-link">{item.label}</a>)}</nav>
    </div>
  </header>;
}
