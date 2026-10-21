"use client";

import { useEffect, useRef } from "react";
import { useNotify } from "@/components/feedback-provider";

export function ActionToast({ result, successMessage }: { result: { ok?: boolean; error?: string; warning?: string } | null | undefined; successMessage: string }) {
  const notify = useNotify();
  const previous = useRef(result);

  useEffect(() => {
    if (!result || result === previous.current || (result.ok !== true && !result.error && !result.warning)) return;
    previous.current = result;
    if (result.ok === true) {
      if (result.warning) {
        notify("warning", result.warning, "Warning");
      } else {
        notify("success", successMessage, "Success");
      }
    } else if (result.error) {
      notify("error", result.error, "Action Failed");
    } else {
      notify("error", "That action could not be completed.", "Action Failed");
    }
  }, [notify, result, successMessage]);

  return null;
}
