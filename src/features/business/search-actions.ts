"use server";

import { listLevels } from "@/lib/api/levels";
import { listMembers } from "@/lib/api/members";
import { listMovements } from "@/lib/api/purchases";
import { listUsers } from "@/lib/api/users";
import type { MemberStatus, Tier } from "@/lib/domain";
import { requireActionUser } from "@/lib/session";

export type SearchSource = {
  members: Array<{
    code: string;
    fullName: string;
    email: string;
    phone: string;
    tierName: string;
    tier: Tier;
    status: MemberStatus;
    validUntil: string;
  }>;
  users: Array<{ id: number; name: string; email: string; role: "admin" | "employee"; isActive: boolean }>;
  levels: Array<{ id: number; name: string; tier: Tier; customersCount: number }>;
  movements: Array<{
    id: string;
    memberCode: string;
    memberName: string;
    concept: string;
    amountCents: number;
    createdAt: string;
  }>;
};

const maxItems = 500;

export async function loadSearchSourceAction(): Promise<SearchSource | null> {
  await requireActionUser(["admin"]);

  try {
    const [members, users, levels, movements] = await Promise.all([
      listMembers({ page: 1, pageSize: maxItems }),
      listUsers(),
      listLevels(),
      listMovements({ period: "all", page: 1, pageSize: maxItems }),
    ]);

    return {
      members: members.items.map((member) => ({
        code: member.code,
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
        tierName: member.tierName,
        tier: member.tier,
        status: member.status,
        validUntil: member.validUntil,
      })),
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      })),
      levels: levels.map((level) => ({
        id: level.id,
        name: level.name,
        tier: level.tier,
        customersCount: level.customersCount,
      })),
      movements: movements.page.items.map((purchase) => ({
        id: purchase.id,
        memberCode: purchase.memberCode,
        memberName: purchase.memberName,
        concept: purchase.concept,
        amountCents: purchase.breakdown.amountCents,
        createdAt: purchase.createdAt,
      })),
    };
  } catch {
    return null;
  }
}
