import { ArrowDownLeft, ArrowRight } from "@/components/ui/icons";
import { landingContent } from "@/content/landing";
import { SectionLabel } from "./primitives";

export function WorkflowSection() {
  const content = landingContent.workflow;
  return <section id="workflow" className="landing-band">
    <div className="landing-container landing-section" aria-labelledby="workflow-title">
      <div className="landing-section-heading"><SectionLabel>{content.eyebrow}</SectionLabel><h2 id="workflow-title">{content.title}</h2></div>
      <ol className="landing-workflow">{content.steps.map((step, index) => <li key={step.title}><span className="landing-step-number">0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      <div className="landing-loop-back" aria-label="Then review, improve, and begin again"><span/><ArrowDownLeft size={20}/><span>Then begin again</span><ArrowRight size={16}/></div>
    </div>
  </section>;
}
