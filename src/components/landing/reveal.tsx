"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);
  return <motion.div className={`${className} ${entered || reduceMotion ? "is-in-view" : ""}`} initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} onViewportEnter={() => setEntered(true)} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.4, ease: "easeOut", delay: delay / 1000 }}>{children}</motion.div>;
}
