import type { Member, MemberStatus, Page, Tier } from "@/lib/domain";
import { getBenefits } from "./levels";
import { simulateLatency } from "./mock/latency";
import { matchesQuery, paginate } from "./paginate";
import {
  isExpiringSoon,
  mockStore,
  resolveMemberStatus,
  type StoredMember,
} from "./mock/store";

function toMember(stored: StoredMember): Member {
  return {
    code: stored.code,
    fullName: stored.fullName,
    email: stored.email,
    phone: stored.phone,
    tier: stored.tier,
    status: resolveMemberStatus(stored),
    expiringSoon: isExpiringSoon(stored),
    issuedAt: stored.issuedAt,
    validUntil: stored.validUntil,
    points: stored.points,
    cashbackBalanceCents: stored.cashbackBalanceCents,
    benefits: getBenefits(stored.tier),
  };
}

export function normalizeMemberCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

export async function findMemberByCode(rawCode: string): Promise<Member | null> {
  await simulateLatency();
  const code = normalizeMemberCode(rawCode);
  const stored = mockStore().members.find((member) => member.code === code);

  return stored ? toMember(stored) : null;
}

export type MemberFilters = {
  query?: string;
  tier?: Tier;
  status?: MemberStatus | "expiring";
  page: number;
};

export async function listMembers({ query, tier, status, page }: MemberFilters): Promise<Page<Member>> {
  await simulateLatency();
  const members = mockStore().members
    .map(toMember)
    .filter((member) => matchesQuery(query, member.fullName, member.email, member.code))
    .filter((member) => !tier || member.tier === tier)
    .filter((member) => {
      if (!status) return true;
      if (status === "expiring") return member.expiringSoon;
      return member.status === status;
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));

  return paginate(members, page);
}

export async function countMembers(): Promise<{ all: number; active: number; expiring: number; cancelled: number }> {
  const members = mockStore().members.map(toMember);

  return {
    all: members.length,
    active: members.filter((member) => member.status === "active").length,
    expiring: members.filter((member) => member.expiringSoon).length,
    cancelled: members.filter((member) => member.status === "cancelled").length,
  };
}

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let index = 0; index < 5; index += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MP-${suffix}`;
}

type CreateMemberInput = {
  fullName: string;
  email: string;
  phone: string;
  tier: Tier;
};

export type CreateMemberResult =
  | { ok: true; code: string }
  | { ok: false; reason: "emailTaken" };

const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;

export async function createMember(input: CreateMemberInput): Promise<CreateMemberResult> {
  const email = input.email.trim().toLowerCase();
  if (mockStore().members.some((member) => member.email.toLowerCase() === email)) {
    return { ok: false, reason: "emailTaken" };
  }

  let code = generateCode();
  while (mockStore().members.some((member) => member.code === code)) code = generateCode();

  const now = Date.now();
  mockStore().members.push({
    code,
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    tier: input.tier,
    cancelled: false,
    issuedAt: new Date(now).toISOString(),
    validUntil: new Date(now + oneYearInMilliseconds).toISOString(),
    points: 0,
    cashbackBalanceCents: 0,
  });

  return { ok: true, code };
}

type UpdateMemberInput = {
  code: string;
  fullName: string;
  email: string;
  phone: string;
};

export type UpdateMemberResult = { ok: true } | { ok: false; reason: "notFound" | "emailTaken" };

export async function updateMember({ code, fullName, email, phone }: UpdateMemberInput): Promise<UpdateMemberResult> {
  const stored = mockStore().members.find((member) => member.code === code);
  if (!stored) return { ok: false, reason: "notFound" };

  const normalizedEmail = email.trim().toLowerCase();
  const taken = mockStore().members.some(
    (member) => member.code !== code && member.email.toLowerCase() === normalizedEmail,
  );
  if (taken) return { ok: false, reason: "emailTaken" };

  stored.fullName = fullName.trim();
  stored.email = normalizedEmail;
  stored.phone = phone.trim();
  return { ok: true };
}

export async function cancelMember(code: string): Promise<boolean> {
  const stored = mockStore().members.find((member) => member.code === code);
  if (!stored) return false;
  stored.cancelled = true;
  return true;
}

export async function listActiveMembers(): Promise<Member[]> {
  await simulateLatency();

  return mockStore()
    .members.map(toMember)
    .filter((member) => member.status === "active")
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));
}
