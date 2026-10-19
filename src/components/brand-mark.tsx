import Image from "next/image";

type BrandMarkProps = { className?: string; size?: "small" | "standard" | "large" };

export function BrandMark({ className = "", size = "standard" }: BrandMarkProps) {
  return <span aria-hidden="true" className={`personna-brand-mark personna-brand-mark-${size} ${className}`}>
    <picture>
      <source srcSet="/Minimalist%20Geometric%20P%20Emblem.svg" type="image/svg+xml"/>
      <Image src="/Minimalist%20Geometric%20P%20Emblem.png" alt="" width={1254} height={1254} unoptimized/>
    </picture>
  </span>;
}
