import type { Level, Tier, TierBenefits } from "@/lib/domain";
import { simulateLatency } from "./mock/latency";
import { mockStore } from "./mock/store";

export async function listLevels(): Promise<Level[]> {
  await simulateLatency();
  return [...mockStore().levels].sort((a, b) => a.minPoints - b.minPoints);
}

export function getBenefits(tier: Tier): TierBenefits {
  return mockStore().levels.find((level) => level.tier === tier)!.benefits;
}

export async function countMembersByTier(): Promise<Record<Tier, number>> {
  const counts: Record<Tier, number> = { bronze: 0, silver: 0, gold: 0, onyx: 0 };
  for (const member of mockStore().members) {
    if (!member.cancelled) counts[member.tier] += 1;
  }
  return counts;
}

type UpdateLevelInput = {
  tier: Tier;
  minPoints: number;
  benefits: TierBenefits;
};

export async function updateLevel({ tier, minPoints, benefits }: UpdateLevelInput): Promise<void> {
  const level = mockStore().levels.find((item) => item.tier === tier);
  if (!level) return;
  level.minPoints = minPoints;
  level.benefits = benefits;
}
