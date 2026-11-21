import type { BusinessStatus, Page, PlatformBusiness, PlatformBusinessDetail } from "@/lib/domain";
import { BackendError, backendCall, backendGet, toPage, type BackendPage } from "./backend";

export type PlatformSummary = {
  all: number;
  trial: number;
  active: number;
  suspended: number;
  customersCount: number;
  usersCount: number;
};

type BackendPlatformSummary = {
  all: number;
  trial: number;
  active: number;
  suspended: number;
  customers_count: number;
  users_count: number;
};

export async function getPlatformSummary(): Promise<PlatformSummary> {
  const summary = await backendGet<BackendPlatformSummary>("/platform/business/summary");

  return {
    all: summary.all,
    trial: summary.trial,
    active: summary.active,
    suspended: summary.suspended,
    customersCount: summary.customers_count,
    usersCount: summary.users_count,
  };
}

type BackendBusiness = {
  id: number;
  name: string;
  status: BusinessStatus;
  customers_count: number;
  logo_url?: string | null;
  created_at: string;
};

function toPlatformBusiness(business: BackendBusiness): PlatformBusiness {
  return {
    id: business.id,
    name: business.name,
    status: business.status,
    customersCount: business.customers_count,
    logoUrl: business.logo_url ?? null,
    createdAt: business.created_at,
  };
}

type BackendBusinessDetail = BackendBusiness & {
  validity_months: number;
  users_count: number;
};

function toPlatformBusinessDetail(business: BackendBusinessDetail): PlatformBusinessDetail {
  return {
    ...toPlatformBusiness(business),
    validityMonths: business.validity_months,
    usersCount: business.users_count,
  };
}

export type BusinessFilters = {
  query?: string;
  status?: BusinessStatus;
  page: number;
};

export async function listBusinesses({ query, status, page }: BusinessFilters): Promise<Page<PlatformBusiness>> {
  const result = await backendGet<BackendPage<BackendBusiness>>("/platform/business/list", {
    q: query,
    status,
    page,
  });

  return toPage(result, toPlatformBusiness);
}

/** Detalle de un negocio, o `null` si no existe (404 `business_not_found`). */
export async function getPlatformBusiness(id: number): Promise<PlatformBusinessDetail | null> {
  const result = await backendCall<BackendBusinessDetail>("GET", `/platform/business/${id}`);
  if (result.ok) return toPlatformBusinessDetail(result.data);
  if (result.status === 404) return null;

  throw new BackendError(result.status, result.code);
}

export type SettableBusinessStatus = Exclude<BusinessStatus, "trial">;

export type BusinessStatusResult =
  | { ok: true }
  | { ok: false; reason: "notFound" | "trialNotAllowed" | "unavailable" };

/** Suspende o reactiva un negocio. `trial` no se puede pedir: responde 422. */
export async function updateBusinessStatus(
  id: number,
  status: SettableBusinessStatus,
): Promise<BusinessStatusResult> {
  const result = await backendCall<BackendBusinessDetail>("PATCH", `/platform/business/${id}/update`, {
    body: { status },
  });
  if (result.ok) return { ok: true };
  if (result.status === 404) return { ok: false, reason: "notFound" };
  if (result.status === 422) return { ok: false, reason: "trialNotAllowed" };

  return { ok: false, reason: "unavailable" };
}
