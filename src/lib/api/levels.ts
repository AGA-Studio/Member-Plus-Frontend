import type { Level, Tier } from "@/lib/domain";
import { backendCall, backendGet } from "./backend";

type BackendTier = {
  id: number;
  name: string;
  finish: Tier;
  price_cents: number;
  discount_percent: number;
  points_per_ten: number;
  cashback_percent: number;
  customers_count: number;
};

function toLevel(tier: BackendTier): Level {
  return {
    id: tier.id,
    name: tier.name,
    tier: tier.finish,
    priceCents: tier.price_cents,
    customersCount: tier.customers_count,
    benefits: {
      discountPercent: tier.discount_percent,
      pointsPerTenPesos: tier.points_per_ten,
      cashbackPercent: tier.cashback_percent,
    },
  };
}

export async function listLevels(): Promise<Level[]> {
  const tiers = await backendGet<BackendTier[]>("/tier/list");

  return tiers.map(toLevel);
}

type UpdateLevelInput = Pick<Level, "id" | "priceCents" | "benefits">;

export type UpdateLevelResult = { ok: true } | { ok: false; reason: "invalid" | "unavailable" };

export async function updateLevel({ id, priceCents, benefits }: UpdateLevelInput): Promise<UpdateLevelResult> {
  const result = await backendCall<BackendTier>("PATCH", `/tier/${id}/update`, {
    body: {
      price_cents: priceCents,
      discount_percent: benefits.discountPercent,
      points_per_ten: benefits.pointsPerTenPesos,
      cashback_percent: benefits.cashbackPercent,
    },
  });
  if (result.ok) return { ok: true };

  return { ok: false, reason: result.code === "tier_invalid" ? "invalid" : "unavailable" };
}
