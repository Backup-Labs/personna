"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AlertTriangle, Check, CircleAlert, X } from "@/components/ui/icons";

export type ToastKind = "success" | "error" | "warning" | "info";
type Toast = { id: number; kind: ToastKind; message: string; title?: string };
export type Notify = (kind: ToastKind, message: string, title?: string) => void;
const FeedbackContext = createContext<Notify>(() => undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback<Notify>((kind, message, title) => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current, { id, kind, message, title }].slice(-4));
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 4500);
  }, []);

  return <FeedbackContext.Provider value={notify}>
    {children}
    <div className="toast-stack" aria-label="Notifications" aria-live="polite" aria-relevant="additions">
      {toasts.map(toast => {
        const defaultTitle = toast.title ?? (
          toast.kind === "success" ? "Success" :
          toast.kind === "error" ? "Error" :
          toast.kind === "warning" ? "Warning" : "Notice"
        );
        return (
          <div key={toast.id} className={`app-toast app-toast-${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
            <span className="app-toast-icon">
              {toast.kind === "success" ? <Check size={16}/> :
               toast.kind === "warning" ? <AlertTriangle size={16}/> :
               <CircleAlert size={16}/>}
            </span>
            <div className="min-w-0 flex-1">
              <p className="app-toast-title">{defaultTitle}</p>
              <p className="app-toast-message">{toast.message}</p>
            </div>
            <button type="button" aria-label="Dismiss notification" onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))}>
              <X size={14}/>
            </button>
          </div>
        );
      })}
    </div>
  </FeedbackContext.Provider>;
}

export function useNotify() { return useContext(FeedbackContext); }
