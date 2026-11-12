import { QRCodeSVG } from "qrcode.react";
import { cx } from "@/lib/cx";
import type { Tier } from "@/lib/domain";

const tierClasses: Record<Tier, string> = {
  bronze: "bg-tier-bronze text-tier-bronze-foreground",
  silver: "bg-tier-silver text-tier-silver-foreground",
  gold: "bg-tier-gold text-tier-gold-foreground",
  onyx: "bg-tier-onyx text-tier-onyx-foreground ring-1 ring-tier-onyx-edge",
};

type MembershipCardProps = {
  tier: Tier;
  tierLabel: string;
  businessName: string;
  memberName: string;
  code: string;
  className?: string;
};

export function MembershipCard({
  tier,
  tierLabel,
  businessName,
  memberName,
  code,
  className,
}: MembershipCardProps) {
  return (
    <div
      className={cx(
        "relative flex aspect-card flex-col justify-between overflow-hidden rounded-card p-6 shadow-lg",
        tierClasses[tier],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-display text-lg font-semibold">{businessName}</span>
        <span className="rounded-full border border-current px-3 py-1 text-xs font-semibold">
          {tierLabel}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium">{memberName}</span>
          <span className="font-mono text-sm tabular-nums">{code}</span>
        </div>
        <div className="rounded-md bg-white p-2 text-ink-900">
          <QRCodeSVG
            value={code}
            size={56}
            level="M"
            fgColor="currentColor"
            bgColor="transparent"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
