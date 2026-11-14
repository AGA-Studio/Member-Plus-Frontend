import { cx } from "@/lib/cx";

export type IconButtonTone = "muted" | "strong" | "inverse";

export function iconButtonClasses(tone: IconButtonTone): string {
  return cx(
    "flex size-11 items-center justify-center transition-[background-color,color,transform] duration-150 ease-out active:scale-97",
    tone === "inverse"
      ? "rounded-full text-ink-300 hover:bg-white/10 hover:text-white"
      : cx("rounded-md hover:bg-surface-muted hover:text-foreground", tone === "strong" ? "text-foreground" : "text-muted"),
  );
}
