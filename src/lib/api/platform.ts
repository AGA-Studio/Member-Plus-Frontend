import type { BusinessStatus, Page, PlatformBusiness } from "@/lib/domain";
import { backendGet, toPage, type BackendPage } from "./backend";

type BackendBusiness = {
  id: number;
  name: string;
  status: BusinessStatus;
  customers_count: number;
  logo_url?: string | null;
  created_at: string;
};

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

  return toPage(result, (business) => ({
    id: business.id,
    name: business.name,
    status: business.status,
    customersCount: business.customers_count,
    logoUrl: business.logo_url ?? null,
    createdAt: business.created_at,
  }));
}
