import type { Member } from "@/lib/domain";
import { mockMembers } from "./mock/members";

export function normalizeMemberCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

export async function findMemberByCode(rawCode: string): Promise<Member | null> {
  const code = normalizeMemberCode(rawCode);

  return mockMembers.find((member) => member.code === code) ?? null;
}
