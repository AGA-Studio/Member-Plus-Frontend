import { useTranslations } from "next-intl";
import { MembershipCard } from "@/components/ui/membership-card";

const cardEnter =
  "transition-[opacity,translate] duration-300 ease-out starting:translate-y-2 starting:opacity-0";

export function LoginBrandPanel() {
  const t = useTranslations("auth.login.brand");

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-brand">
      <div className="relative flex flex-1 items-center justify-center">
        <div className="absolute w-84 -translate-y-16 translate-x-12 rotate-6 lg:w-105 lg:-translate-y-16 lg:translate-x-20">
          <MembershipCard
            tier="onyx"
            tierLabel={t("cards.onyx.tier")}
            businessName={t("businessName")}
            memberName={t("cards.onyx.member")}
            code={t("cards.onyx.code")}
            className={cardEnter}
          />
        </div>
        <div className="absolute w-84 -translate-x-8 translate-y-12 -rotate-6 lg:w-105 lg:-translate-x-12 lg:translate-y-24">
          <MembershipCard
            tier="gold"
            tierLabel={t("cards.gold.tier")}
            businessName={t("businessName")}
            memberName={t("cards.gold.member")}
            code={t("cards.gold.code")}
            className={`delay-60 ${cardEnter}`}
          />
        </div>
      </div>
      <h2 className="relative hidden max-w-xl p-16 text-display text-white lg:block">
        {t("headline")}
      </h2>
    </div>
  );
}
