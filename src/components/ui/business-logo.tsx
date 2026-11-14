import Image from "next/image";
import { cx } from "@/lib/cx";

type BusinessLogoProps = {
  name: string;
  initials: string;
  logoUrl: string | null;
  className?: string;
};

export function BusinessLogo({ name, initials, logoUrl, className }: BusinessLogoProps) {
  return (
    <span
      className={cx(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-sm font-semibold text-primary-foreground",
        className,
      )}
    >
      {logoUrl ? (
        <Image src={logoUrl} alt={name} fill unoptimized sizes="48px" className="bg-surface object-contain p-1" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
