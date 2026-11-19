import type { MemberStatus } from "@/lib/domain";
import type { SearchEntry } from "@/lib/search";
import type { SearchSource } from "./search-actions";

export type SearchLabels = {
  pages: Array<{ href: string; label: string }>;
  pageHint: string;
  status: Record<MemberStatus, string>;
  roles: Record<"admin" | "employee", string>;
  noConcept: string;
  validUntil: (date: string) => string;
  customersCount: (count: number) => string;
  amount: (cents: number) => string;
  date: (iso: string) => string;
  inactive: string;
};

export function buildSearchEntries(source: SearchSource | null, labels: SearchLabels): SearchEntry[] {
  const entries: SearchEntry[] = labels.pages.map((page) => ({
    id: `page:${page.href}`,
    group: "pages",
    title: page.label,
    subtitle: labels.pageHint,
    href: page.href,
    fields: [],
  }));

  if (!source) return entries;

  for (const member of source.members) {
    const customerHref = `/clientes/${encodeURIComponent(member.code)}`;

    entries.push({
      id: `customer:${member.code}`,
      group: "customers",
      title: member.fullName,
      subtitle: `${member.code} · ${member.email}`,
      href: customerHref,
      fields: [member.email, member.phone, member.code],
    });

    entries.push({
      id: `membership:${member.code}`,
      group: "memberships",
      title: member.code,
      subtitle: `${member.tierName} · ${labels.status[member.status]} · ${labels.validUntil(member.validUntil)}`,
      href: `/membresias?q=${encodeURIComponent(member.code)}`,
      fields: [member.tierName, labels.status[member.status]],
    });
  }

  for (const user of source.users) {
    entries.push({
      id: `user:${user.id}`,
      group: "users",
      title: user.name,
      subtitle: `${user.email} · ${labels.roles[user.role]}${user.isActive ? "" : ` · ${labels.inactive}`}`,
      href: "/usuarios",
      fields: [user.email, labels.roles[user.role]],
    });
  }

  for (const level of source.levels) {
    entries.push({
      id: `level:${level.id}`,
      group: "levels",
      title: level.name,
      subtitle: labels.customersCount(level.customersCount),
      href: "/niveles",
      fields: [],
    });
  }

  for (const movement of source.movements) {
    const concept = movement.concept || labels.noConcept;

    entries.push({
      id: `movement:${movement.id}`,
      group: "movements",
      title: movement.memberName,
      subtitle: `${concept} · ${labels.amount(movement.amountCents)} · ${labels.date(movement.createdAt)}`,
      href: `/clientes/${encodeURIComponent(movement.memberCode)}`,
      fields: [movement.concept, movement.memberCode],
    });
  }

  return entries;
}
