"use client";

import { Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type RedeemPointsButtonProps = {
  points: number;
};

export function RedeemPointsButton({ points }: RedeemPointsButtonProps) {
  const t = useTranslations("cashier.purchase.member");

  return (
    <Button variant="secondary" onClick={() => window.alert(`${t("redeemPoints")}: ${points}`)}>
      <Gift aria-hidden strokeWidth={1.75} className="size-5" />
      {t("redeemPoints")}
    </Button>
  );
}
