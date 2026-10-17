import { ArrowRight, Check, CircleDollarSign, MessageSquareText, ReceiptText } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { CheckList, Chip, ProgressBar, SectionLabel } from "./primitives";
import { Reveal } from "./reveal";

export function MomoShowcase() {
  const content = landingContent.momo;
  return <section className="landing-section landing-container landing-showcase" aria-labelledby="momo-title">
    <Reveal className="landing-showcase-copy"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="momo-title">{content.title}</h2><p>{content.description}</p><CheckList items={content.bullets}/></Reveal>
    <Reveal className="landing-illustration-wrap"><div className="landing-momo-illustration">
      <div className="landing-sms-card"><div className="landing-sms-head"><MessageSquareText size={15}/>{content.messageType}</div><p>{content.message}</p><span>{content.sentAt}</span></div>
      <div className="landing-convert-arrow"><span/><ArrowRight size={20}/><span>{content.parsed}</span></div>
      <div className="landing-transaction-card"><div className="flex items-center gap-3"><span className="landing-icon-tile"><ReceiptText size={18}/></span><div><small>{content.transactionAdded}</small><strong>{content.merchant}</strong></div><Check size={16} className="ml-auto text-[var(--success)]"/></div><div className="landing-transaction-amount"><span>{content.category}</span><strong>{content.amount}</strong></div><div className="landing-transaction-foot"><span><CircleDollarSign size={13}/>{content.paymentType}</span><Chip>{content.fee}</Chip></div><ProgressBar value={100} tone="success" label={content.parsed}/></div>
    </div></Reveal>
  </section>;
}
