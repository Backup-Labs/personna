"use client";

import { useEffect, useRef } from "react";
import { useNotify } from "@/components/feedback-provider";

export function ActionToast({ result, successMessage }: { result: { ok?: boolean; error?: string } | null | undefined; successMessage: string }) {
  const notify = useNotify();
  const previous = useRef(result);

  useEffect(() => {
    if (!result || result === previous.current || (result.ok !== true && !result.error)) return;
    previous.current = result;
    notify(result.ok === true ? "success" : "error", result.ok === true ? successMessage : result.error || "That action could not be completed.");
  }, [notify, result, successMessage]);

  return null;
}
