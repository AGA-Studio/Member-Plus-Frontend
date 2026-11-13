"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useActionState, useEffect, useId, useState } from "react";
import { Alert } from "@/components/ui/alert";
import Link from "next/link";
import { Button, buttonStyles } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast-provider";
import { cx } from "@/lib/cx";
import type { Member, TierBenefits } from "@/lib/domain";
import {
  formatDiscount,
  formatMoney,
  formatPositiveMoney,
  formatSignedPoints,
  parseAmountToCents,
} from "@/lib/format";
import { calculatePurchase } from "@/lib/pricing";
import { registerPurchaseAction, type PurchaseState } from "./actions";

type PurchaseFormProps = {
  member: (Pick<Member, "code" | "cashbackBalanceCents" | "status"> & {
    benefits: TierBenefits;
    tierLabel: string;
  }) | null;
};

const initialState: PurchaseState = {};

const noBenefits: TierBenefits = { discountPercent: 0, pointsPerTenPesos: 0, cashbackPercent: 0 };

function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  return rest.length > 0 ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
}

export function PurchaseForm({ member }: PurchaseFormProps) {
  const t = useTranslations("cashier.purchase");
  const format = useFormatter();
  const { show } = useToast();
  const [state, formAction, pending] = useActionState(registerPurchaseAction, initialState);
  const [amount, setAmount] = useState("");
  const [useCashback, setUseCashback] = useState(false);
  const switchLabelId = useId();
  const switchHintId = useId();
  const submitHintId = useId();

  useEffect(() => {
    if (state.error) show("danger", t(`errors.${state.error}`));
  }, [state, show, t]);

  const hasMember = member !== null;
  const cashbackBalanceCents = member?.cashbackBalanceCents ?? 0;
  const isActive = member?.status === "active";
  const benefits = member && isActive ? member.benefits : noBenefits;
  const canUseCashback = isActive && cashbackBalanceCents > 0;
  const amountCents = parseAmountToCents(amount);
  const breakdown = calculatePurchase({
    amountCents,
    benefits,
    useCashback: useCashback && canUseCashback,
    cashbackBalanceCents,
  });
  const hasAmount = amountCents > 0;
  const empty = "—";

  function handleBlur() {
    if (!hasAmount) return;
    setAmount(
      format.number(amountCents / 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-5 pb-28 shadow-sm sm:p-6 lg:pb-6"
    >
      <input type="hidden" name="memberCode" value={member?.code ?? ""} />
      <input type="hidden" name="useCashback" value={useCashback && canUseCashback ? "on" : ""} />

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-heading text-foreground">{t("title")}</h1>
        {hasMember ? (
          <Link href="/caja" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            {t("cancel")}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm font-medium text-foreground">
          {t("amount")}
        </label>
        <div className="flex h-16 items-center gap-2 rounded-md border border-border-strong bg-surface px-4 transition-colors duration-150 ease-out focus-within:border-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring has-disabled:bg-surface-muted">
          <span aria-hidden className="font-display text-title font-semibold text-muted">
            {t("currencySymbol")}
          </span>
          <input
            id="amount"
            name="amount"
            disabled={!hasMember}
            value={amount}
            onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
            onFocus={() => setAmount((current) => current.replace(/,/g, ""))}
            onBlur={handleBlur}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            className="min-w-0 flex-1 bg-transparent font-display text-title font-semibold tabular-nums text-foreground outline-none placeholder:text-border-strong disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-muted">{t("currency")}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="concept" className="text-sm font-medium text-foreground">
          {t("concept")} <span className="font-normal text-muted">{t("optional")}</span>
        </label>
        <input
          id="concept"
          name="concept"
          disabled={!hasMember}
          autoComplete="off"
          placeholder={t("conceptPlaceholder")}
          className="h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-base text-foreground transition-[border-color] duration-150 ease-out placeholder:text-muted focus:border-primary disabled:cursor-not-allowed disabled:bg-surface-muted"
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border border-border p-4">
        <div className="flex flex-col gap-0.5">
          <span id={switchLabelId} className="text-base font-medium text-foreground">
            {t("useCashback")}
          </span>
          <span id={switchHintId} className="text-sm text-muted">
            {!hasMember
              ? t("cashbackNoMember")
              : canUseCashback
                ? t("cashbackAvailable", { amount: formatMoney(format, cashbackBalanceCents) })
                : t("cashbackUnavailable")}
          </span>
        </div>
        <Switch
          checked={useCashback && canUseCashback}
          onCheckedChange={setUseCashback}
          disabled={!canUseCashback}
          aria-labelledby={switchLabelId}
          aria-describedby={switchHintId}
        />
      </div>

      <dl className="flex flex-col gap-3 rounded-lg bg-surface-muted p-5" aria-live="polite">
        <SummaryRow
          label={t("summary.amount")}
          value={hasAmount ? formatMoney(format, breakdown.amountCents) : empty}
        />
        <SummaryRow
          label={
            member
              ? t("summary.discount", { tier: member.tierLabel, percent: benefits.discountPercent })
              : t("summary.discountEmpty")
          }
          value={hasAmount ? formatDiscount(format, breakdown.discountCents) : empty}
          tone="positive"
        />
        {breakdown.cashbackAppliedCents > 0 ? (
          <SummaryRow
            label={t("summary.cashbackUsed")}
            value={formatDiscount(format, breakdown.cashbackAppliedCents)}
            tone="positive"
            enter
          />
        ) : null}
        <div className="border-t border-border pt-3">
          <SummaryRow
            label={t("summary.total")}
            value={formatMoney(format, breakdown.totalCents)}
            tone="total"
          />
        </div>
        <SummaryRow
          label={t("summary.pointsEarned")}
          value={formatSignedPoints(format, breakdown.pointsEarned)}
          tone="positive"
        />
        <SummaryRow
          label={t("summary.cashbackEarned")}
          value={formatPositiveMoney(format, breakdown.cashbackEarnedCents)}
          tone="positive"
        />
      </dl>

      <div className="fixed inset-x-0 bottom-0 z-10 flex flex-col gap-3 border-t border-border bg-surface p-4 lg:static lg:border-0 lg:bg-transparent lg:p-0">
        {state.error ? (
          <Alert tone="danger">{t(`errors.${state.error}`)}</Alert>
        ) : null}
        {!hasAmount ? (
          <span id={submitHintId} className="sr-only">
            {hasMember ? t("enterAmount") : t("selectMember")}
          </span>
        ) : null}
        <Button
          type="submit"
          size="xl"
          fullWidth
          loading={pending}
          disabled={!hasMember || !hasAmount}
          aria-describedby={!hasMember || !hasAmount ? submitHintId : undefined}
        >
          {pending ? t("registering") : t("submit")}
        </Button>
      </div>
    </form>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  tone?: "normal" | "positive" | "total";
  enter?: boolean;
};

function SummaryRow({ label, value, tone = "normal", enter = false }: SummaryRowProps) {
  return (
    <div
      className={cx(
        "flex items-baseline justify-between gap-4",
        enter && "transition-opacity duration-150 ease-out starting:opacity-0",
      )}
    >
      <dt className={cx("text-base", tone === "total" ? "font-medium text-foreground" : "text-muted")}>
        {label}
      </dt>
      <dd
        className={cx(
          "tabular-nums",
          tone === "total" && "font-display text-heading font-semibold text-foreground",
          tone === "positive" && "text-base font-medium text-success-text",
          tone === "normal" && "text-base text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
