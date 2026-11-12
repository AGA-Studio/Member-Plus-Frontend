import type { BadgeTone } from "@/components/ui/badge";
import type { Member } from "@/lib/domain";

export type MemberStatusKey = "active" | "expiring" | "expired" | "cancelled";

export function getStatusKey(member: Pick<Member, "status" | "expiringSoon">): MemberStatusKey {
  if (member.status === "active" && member.expiringSoon) return "expiring";
  return member.status;
}

export const statusTones: Record<MemberStatusKey, BadgeTone> = {
  active: "success",
  expiring: "warning",
  expired: "danger",
  cancelled: "danger",
};

export function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
