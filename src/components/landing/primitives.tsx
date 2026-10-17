import type { CSSProperties, ReactNode } from "react";
import { Activity, BookOpen, Brain, CircleDollarSign, Clock3, FolderKanban, LayoutDashboard, FileText, Target, type LucideIcon } from "@/components/ui/icons";

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  finance: CircleDollarSign,
  projects: FolderKanban,
  time: Clock3,
  learning: BookOpen,
  notes: FileText,
  growth: Target,
  ai: Brain,
};

export function ModuleIcon({ name, className = "" }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Activity;
  return <Icon aria-hidden="true" className={className} strokeWidth={1.7}/>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="landing-eyebrow"><span aria-hidden="true"/>{children}</p>;
}

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`landing-chip ${className}`}>{children}</span>;
}

export function GlowOrb({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`landing-glow-orb ${className}`}/>;
}

export function ProgressBar({ value, tone = "accent", label }: { value: number; tone?: "accent" | "warning" | "success"; label?: string }) {
  return <div className="landing-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.max(0, value))}>
    <span className={`landing-progress-fill landing-progress-${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }}/>
  </div>;
}

export function ProgressRing({ value, label }: { value: number; label: string }) {
  return <div className="landing-ring" role="img" aria-label={`${label}: ${value}%`} style={{ "--ring-value": `${Math.min(100, Math.max(0, value))}%` } as CSSProperties}>
    <span><strong>{value}</strong><small>%</small></span>
  </div>;
}

export function FeatureCard({ number, icon, title, children, featured = false }: { number?: string; icon: string; title: string; children: ReactNode; featured?: boolean }) {
  return <article className={`landing-feature-card ${featured ? "landing-feature-card-featured" : ""}`}>
    <div className="flex items-start justify-between gap-3"><span className="landing-icon-tile"><ModuleIcon name={icon}/></span>{number && <span className="landing-card-number">{number}</span>}</div>
    <h3>{title}</h3><p>{children}</p>
  </article>;
}

export function CheckList({ items }: { items: readonly string[] }) {
  return <ul className="landing-check-list">{items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>;
}
