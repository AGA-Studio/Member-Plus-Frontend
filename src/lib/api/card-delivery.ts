import { headers } from "next/headers";
import type { MemberStatus, PublicCard, Tier } from "@/lib/domain";
import { findMemberByCode } from "./members";
import { simulateLatency } from "./mock/latency";

type DemoCard = {
  businessName: string;
  fullName: string;
  code: string;
  tier: Tier;
  tierName: string;
  status: MemberStatus;
  validUntil: string;
};

const mockTokenPrefix = "demo-";
const mockGoogleWalletUrl = "https://wallet.google.com/";
const dayInMilliseconds = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * dayInMilliseconds).toISOString();
}

function demoCards(): Record<string, DemoCard> {
  return {
    "demo-mp-4f7k2": {
      businessName: "Café Aurora",
      fullName: "Laura Méndez",
      code: "MP-4F7K2",
      tier: "gold",
      tierName: "Oro",
      status: "active",
      validUntil: daysFromNow(180),
    },
    "demo-mp-vencida": {
      businessName: "Café Aurora",
      fullName: "Marcos Vela",
      code: "MP-1C6YN",
      tier: "silver",
      tierName: "Plata",
      status: "expired",
      validUntil: daysFromNow(-20),
    },
    "demo-mp-cancelada": {
      businessName: "Café Aurora",
      fullName: "Paola Castillo",
      code: "MP-5X1QE",
      tier: "bronze",
      tierName: "Bronce",
      status: "cancelled",
      validUntil: daysFromNow(-70),
    },
  };
}

export async function getPublicCard(token: string): Promise<PublicCard | null> {
  await simulateLatency();
  const card = demoCards()[token.toLowerCase()];
  if (!card) return null;

  return { ...card, googleWalletEnabled: true };
}

export type GoogleWalletResult =
  | { ok: true; url: string }
  | { ok: false; reason: "notFound" | "cancelled" | "unavailable" };

export async function getGoogleWalletUrl(token: string): Promise<GoogleWalletResult> {
  const card = await getPublicCard(token);
  if (!card) return { ok: false, reason: "notFound" };
  if (card.status === "cancelled") return { ok: false, reason: "cancelled" };
  if (!card.googleWalletEnabled) return { ok: false, reason: "unavailable" };

  return { ok: true, url: mockGoogleWalletUrl };
}

export type CardLinkResult = { ok: true; url: string } | { ok: false; reason: "notFound" | "cancelled" };

export async function createCardLink(rawCode: string): Promise<CardLinkResult> {
  await simulateLatency();
  const member = await findMemberByCode(rawCode);
  if (!member) return { ok: false, reason: "notFound" };
  if (member.status === "cancelled") return { ok: false, reason: "cancelled" };

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return { ok: true, url: `${protocol}://${host}/tarjeta/${mockTokenPrefix}${member.code.toLowerCase()}` };
}

export type SendCardEmailResult =
  | { ok: true; sentTo: string }
  | { ok: false; reason: "notFound" | "cancelled" | "failed" };

export async function sendCardEmail(rawCode: string): Promise<SendCardEmailResult> {
  await simulateLatency();
  const member = await findMemberByCode(rawCode);
  if (!member) return { ok: false, reason: "notFound" };
  if (member.status === "cancelled") return { ok: false, reason: "cancelled" };

  return { ok: true, sentTo: member.email };
}
