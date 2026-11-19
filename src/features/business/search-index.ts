import type { MemberStatus, Tier } from "@/lib/domain";
import type { Equivalent, SearchEntry } from "@/lib/search";
import type { SearchSource } from "./search-actions";
import type { NavKey, SearchLocaleLabels } from "./search-locales";

export type SearchLabels = {
  localeIndex: number;
  locales: SearchLocaleLabels[];
  pages: Array<{ href: string; key: NavKey }>;
  pageHint: string;
  noConcept: string;
  validUntil: (date: string) => string;
  customersCount: (count: number) => string;
  amount: (cents: number) => string;
  date: (iso: string) => string;
  inactive: string;
};

export const tierNames: Record<Tier, string[]> = {
  bronze: ["Bronce", "Bronze"],
  silver: ["Plata", "Silver"],
  gold: ["Oro", "Gold"],
  onyx: ["Onyx"],
};

function others<T>(labels: SearchLabels, read: (locale: SearchLocaleLabels) => T): T[] {
  return labels.locales.filter((_, index) => index !== labels.localeIndex).map(read);
}

function tierEquivalent(tier: Tier, shown: string): Equivalent[] {
  return [{ shown, others: tierNames[tier].filter((name) => name !== shown) }];
}

export function buildSearchEntries(source: SearchSource | null, labels: SearchLabels): SearchEntry[] {
  const current = labels.locales[labels.localeIndex];

  const entries: SearchEntry[] = labels.pages.map((page) => {
    const label = current.pages[page.key];
    const alternateLabels = others(labels, (locale) => locale.pages[page.key]);
    const keywords = labels.locales.flatMap((locale) => locale.keywords[page.key].split(" "));

    return {
      id: `page:${page.href}`,
      group: "pages",
      title: label,
      subtitle: labels.pageHint,
      href: page.href,
      fields: [...alternateLabels, ...keywords],
      equivalents: [{ shown: label, others: [...alternateLabels, ...keywords] }],
    };
  });

  if (!source) return entries;

  const statusLabel = (status: MemberStatus) => current.status[status];
  const statusEquivalent = (status: MemberStatus): Equivalent => ({
    shown: statusLabel(status),
    others: others(labels, (locale) => locale.status[status]),
  });
  const roleEquivalent = (role: "admin" | "employee"): Equivalent => ({
    shown: current.roles[role],
    others: others(labels, (locale) => locale.roles[role]),
  });

  for (const member of source.members) {
    entries.push({
      id: `customer:${member.code}`,
      group: "customers",
      title: member.fullName,
      subtitle: `${member.code} · ${member.email}`,
      href: `/clientes/${encodeURIComponent(member.code)}`,
      fields: [member.email, member.phone, member.code],
    });

    entries.push({
      id: `membership:${member.code}`,
      group: "memberships",
      title: member.code,
      subtitle: `${member.tierName} · ${statusLabel(member.status)} · ${labels.validUntil(member.validUntil)}`,
      href: `/membresias?q=${encodeURIComponent(member.code)}`,
      fields: [
        member.tierName,
        ...tierNames[member.tier],
        ...labels.locales.map((locale) => locale.status[member.status]),
      ],
      equivalents: [...tierEquivalent(member.tier, member.tierName), statusEquivalent(member.status)],
    });
  }

  for (const user of source.users) {
    entries.push({
      id: `user:${user.id}`,
      group: "users",
      title: user.name,
      subtitle: `${user.email} · ${current.roles[user.role]}${user.isActive ? "" : ` · ${labels.inactive}`}`,
      href: "/usuarios",
      fields: [user.email, ...labels.locales.map((locale) => locale.roles[user.role])],
      equivalents: [roleEquivalent(user.role)],
    });
  }

  for (const level of source.levels) {
    entries.push({
      id: `level:${level.id}`,
      group: "levels",
      title: level.name,
      subtitle: labels.customersCount(level.customersCount),
      href: "/niveles",
      fields: tierNames[level.tier],
      equivalents: tierEquivalent(level.tier, level.name),
    });
  }

  for (const movement of source.movements) {
    const concept = movement.concept || labels.noConcept;
    const alternateNoConcept = others(labels, (locale) => locale.noConcept);

    entries.push({
      id: `movement:${movement.id}`,
      group: "movements",
      title: movement.memberName,
      subtitle: `${concept} · ${labels.amount(movement.amountCents)} · ${labels.date(movement.createdAt)}`,
      href: `/clientes/${encodeURIComponent(movement.memberCode)}`,
      fields: [movement.concept, movement.memberCode, ...(movement.concept ? [] : alternateNoConcept)],
      equivalents: movement.concept ? [] : [{ shown: labels.noConcept, others: alternateNoConcept }],
    });
  }

  return entries;
}
