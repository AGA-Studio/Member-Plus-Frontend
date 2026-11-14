import type { MemberStatus, PublicCard, Tier } from "@/lib/domain";
import { backendCall } from "./backend";

type BackendPublicCard = {
  business: { name: string; logo_url: string | null };
  full_name: string;
  code: string;
  level: { name: string; finish: Tier };
  status: MemberStatus;
  valid_until: string;
  wallet: { google: boolean };
};

export async function getPublicCard(token: string): Promise<PublicCard | null> {
  const result = await backendCall<BackendPublicCard>("GET", `/card/${encodeURIComponent(token)}`);
  if (result.ok) {
    const card = result.data;

    return {
      businessName: card.business.name,
      businessLogoUrl: card.business.logo_url,
      fullName: card.full_name,
      code: card.code,
      tier: card.level.finish,
      tierName: card.level.name,
      status: card.status,
      validUntil: card.valid_until,
      googleWalletEnabled: card.wallet.google,
    };
  }
  if (result.status === 404) return null;

  throw new Error(`Public card request failed with status ${result.status}`);
}

export type GoogleWalletResult =
  | { ok: true; url: string }
  | { ok: false; reason: "notFound" | "unavailable" };

export async function getGoogleWalletUrl(token: string): Promise<GoogleWalletResult> {
  const result = await backendCall<{ save_url: string }>(
    "GET",
    `/card/${encodeURIComponent(token)}/google-wallet`,
  );
  if (result.ok) return { ok: true, url: result.data.save_url };

  return { ok: false, reason: result.status === 404 ? "notFound" : "unavailable" };
}

export type CardLinkResult =
  | { ok: true; url: string }
  | { ok: false; reason: "notFound" | "notActive" | "unavailable" };

export async function createCardLink(customerId: number): Promise<CardLinkResult> {
  const result = await backendCall<{ url: string; expires_at: string }>(
    "POST",
    `/customer/${customerId}/card-link`,
  );
  if (result.ok) return { ok: true, url: result.data.url };
  if (result.status === 404) return { ok: false, reason: "notFound" };
  if (result.code === "customer_cancelled" || result.code === "customer_expired") {
    return { ok: false, reason: "notActive" };
  }

  return { ok: false, reason: "unavailable" };
}

export type SendCardEmailResult =
  | { ok: true; sentTo: string }
  | { ok: false; reason: "notFound" | "notActive" | "rateLimited" | "failed" };

export async function sendCardEmail(customerId: number): Promise<SendCardEmailResult> {
  const result = await backendCall<{ sent_to: string; last_sent_at: string }>(
    "POST",
    `/customer/${customerId}/card-link/send`,
  );
  if (result.ok) return { ok: true, sentTo: result.data.sent_to };
  if (result.status === 404) return { ok: false, reason: "notFound" };
  if (result.code === "customer_cancelled" || result.code === "customer_expired") {
    return { ok: false, reason: "notActive" };
  }
  if (result.code === "card_email_rate_limited") return { ok: false, reason: "rateLimited" };

  return { ok: false, reason: "failed" };
}
