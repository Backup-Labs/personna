"use client";

import { Check } from "@/components/ui/icons";
import { Fragment } from "react";
import { pricing } from "@/content/pricing";
import { trackLandingEvent } from "./analytics";

export function PlanComparison() {
  return <details className="landing-comparison" onToggle={event => { if (event.currentTarget.open) trackLandingEvent("compare_table_open"); }}>
    <summary>{pricing.compareLabel}</summary>
    <div className="landing-table-wrap"><table><thead><tr><th scope="col">{pricing.includedLabel}</th>{pricing.comparisonHeadings.map(heading => <th key={heading} scope="col">{heading}</th>)}</tr></thead><tbody>
      {pricing.comparisonGroups.map(group => <Fragment key={group.name}><tr className="landing-comparison-group"><th scope="rowgroup" colSpan={4}>{group.name}</th></tr>{group.rows.map(row => <tr key={row.feature}><th scope="row">{row.feature}</th>{([row.starter, row.pro, row.studio] as const).map((value, index) => <td key={index}>{typeof value === "boolean" ? value ? <Check size={15} aria-label={pricing.includedValueLabel}/> : <span aria-label={pricing.unavailableLabel}>{pricing.unavailableSymbol}</span> : value}</td>)}</tr>)}</Fragment>)}
    </tbody></table></div>
  </details>;
}
