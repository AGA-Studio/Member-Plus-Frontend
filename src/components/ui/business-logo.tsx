import { cx } from "@/lib/cx";
import { RemoteImage } from "./remote-image";

type BusinessLogoProps = {
  name: string;
  initials: string;
  logoUrl: string | null;
  className?: string;
  entryOrigin?: boolean;
};

export function BusinessLogo({ name, initials, logoUrl, className, entryOrigin = false }: BusinessLogoProps) {
  return (
    <span
      data-entry-target={entryOrigin ? "origin" : undefined}
      className={cx(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md text-sm font-semibold text-primary-foreground",
        logoUrl ? "bg-surface" : "bg-primary",
        className,
      )}
    >
      {logoUrl ? (
        <RemoteImage
          src={logoUrl}
          alt={name}
          sizes="48px"
          className="rounded-sm bg-surface object-contain p-1"
          fallback={
            <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-primary">
              {initials}
            </span>
          }
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
