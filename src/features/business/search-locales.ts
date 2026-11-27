import type { BusinessUserRole } from "@/lib/api/users";
import type { MemberStatus } from "@/lib/domain";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";

export type NavKey = "dashboard" | "customers" | "levels" | "movements" | "checkout" | "users" | "plan" | "settings";

export type SearchLocaleLabels = {
  pages: Record<NavKey, string>;
  keywords: Record<NavKey, string>;
  status: Record<MemberStatus, string>;
  roles: Record<BusinessUserRole, string>;
  noConcept: string;
};

type Messages = typeof es;

function pick(messages: Messages): SearchLocaleLabels {
  const search = messages.business.topbar.search;

  return {
    pages: {
      dashboard: messages.business.nav.dashboard,
      customers: messages.business.nav.customers,
      levels: messages.business.nav.levels,
      movements: messages.business.nav.movements,
      checkout: messages.business.nav.checkout,
      users: messages.business.nav.users,
      plan: messages.business.nav.plan,
      settings: messages.business.nav.settings,
    },
    keywords: search.keywords,
    status: messages.memberStatus,
    roles: messages.business.users.roles,
    noConcept: messages.business.movements.noConcept,
  };
}

export function getSearchLocales(): SearchLocaleLabels[] {
  return [pick(es), pick(en as Messages)];
}
