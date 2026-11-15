import Image from "next/image";
import { cx } from "@/lib/cx";

type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  className?: string;
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar({ name, photoUrl, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cx(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-sm font-medium text-primary-text",
        className,
      )}
    >
      {photoUrl ? (
        <Image src={photoUrl} alt="" fill unoptimized sizes="56px" className="object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
