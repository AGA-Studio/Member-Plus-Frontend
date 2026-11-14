"use client";

import { Check, Info, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";

export type ToastTone = "success" | "danger" | "info";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
  leaving: boolean;
};

type ToastContextValue = {
  show: (tone: ToastTone, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const visibleMilliseconds = 4000;
const dangerVisibleMilliseconds = 6000;
const leaveMilliseconds = 160;

const toneIcons = {
  success: Check,
  danger: TriangleAlert,
  info: Info,
} satisfies Record<ToastTone, typeof Info>;

const toneClasses: Record<ToastTone, string> = {
  success: "bg-success text-success-foreground",
  danger: "bg-danger text-danger-foreground",
  info: "bg-primary text-primary-foreground",
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const regionRef = useRef<HTMLDivElement>(null);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
      );
      window.setTimeout(() => remove(id), leaveMilliseconds);
    },
    [remove],
  );

  const show = useCallback(
    (tone: ToastTone, message: string) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current.slice(-2), { id, tone, message, leaving: false }]);
      window.setTimeout(
        () => dismiss(id),
        tone === "danger" ? dangerVisibleMilliseconds : visibleMilliseconds,
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  const hasToasts = toasts.length > 0;
  const newestId = toasts.at(-1)?.id ?? 0;

  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;

    const isOpen = region.matches(":popover-open");
    if (!hasToasts) {
      if (isOpen) region.hidePopover();
      return;
    }

    const dialogIsOpen = document.querySelector("dialog[open]") !== null;
    if (isOpen && dialogIsOpen) region.hidePopover();
    if (!region.matches(":popover-open")) region.showPopover();
  }, [hasToasts, newestId]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        ref={regionRef}
        popover="manual"
        role="region"
        aria-label={t("toastRegion")}
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-auto top-4 m-0 h-auto w-auto overflow-visible border-0 bg-transparent p-0 flex flex-col items-center gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end"
      >
        {toasts.map((toast) => {
          const Icon = toneIcons[toast.tone];

          return (
            <div
              key={toast.id}
              className={cx(
                "pointer-events-auto flex w-fit min-w-72 max-w-full items-center gap-3 rounded-lg bg-ink-900 py-1 pl-3 pr-1 text-white shadow-lg ring-1 ring-white/10 sm:max-w-xl",
                "transition-[opacity,translate] ease-out starting:-translate-y-2 starting:opacity-0",
                toast.leaving ? "-translate-y-2 opacity-0 duration-150" : "translate-y-0 opacity-100 duration-200",
              )}
            >
              <span className={cx("flex size-6 shrink-0 items-center justify-center rounded-full", toneClasses[toast.tone])}>
                <Icon aria-hidden strokeWidth={2.5} className="size-3.5" />
              </span>
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label={t("dismissToast")}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-ink-300 transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-97"
              >
                <X aria-hidden strokeWidth={1.75} className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
