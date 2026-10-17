import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { StartFreeLink } from "./cta";

export function LandingFooter() {
  const content = landingContent.footer;
  return <footer id="footer" className="landing-footer"><div className="landing-container">
    <div className="landing-footer-intro"><div><p className="landing-footer-kicker">{landingContent.ui.brand}</p><h2>Build a life that<br/><span>moves with intention.</span></h2><p>{content.description}</p></div><StartFreeLink className="landing-footer-cta">Create your workspace <ArrowUpRight size={16}/></StartFreeLink></div>
    <div className="landing-footer-grid">{content.columns.map(column => <div key={column.title}><h2>{column.title}</h2><ul>{column.links.map(link => <li key={link.label}><Link href={link.href}>{link.label}</Link></li>)}</ul></div>)}
    </div><div className="landing-footer-bottom"><span>{content.copyright}</span><a href="#top">{content.backToTop}</a></div>
  </div></footer>;
}
