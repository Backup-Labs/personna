"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Check, CircleAlert, X } from "@/components/ui/icons";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };
type Notify = (kind: ToastKind, message: string) => void;
const FeedbackContext = createContext<Notify>(() => undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback<Notify>((kind, message) => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current, { id, kind, message }].slice(-4));
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 4500);
  }, []);

  return <FeedbackContext.Provider value={notify}>
    {children}
    <div className="toast-stack" aria-label="Notifications" aria-live="polite" aria-relevant="additions">
      {toasts.map(toast => <div key={toast.id} className={`app-toast app-toast-${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
        <span className="app-toast-icon">{toast.kind === "success" ? <Check size={16}/> : <CircleAlert size={16}/>}</span>
        <p>{toast.message}</p>
        <button type="button" aria-label="Dismiss notification" onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))}><X size={14}/></button>
      </div>)}
    </div>
  </FeedbackContext.Provider>;
}

export function useNotify() { return useContext(FeedbackContext); }
