import { headers } from "next/headers";
import type { PublicCard } from "@/lib/domain";
import { findMemberByCode, normalizeMemberCode } from "./members";
import { mockBusinessNames } from "./mock/businesses";
import { simulateLatency } from "./mock/latency";

const mockTokenPrefix = "demo-";
const mockBusinessId = 1;
const mockGoogleWalletUrl = "https://wallet.google.com/";

function tokenForCode(code: string): string {
  return `${mockTokenPrefix}${code.toLowerCase()}`;
}

function codeFromToken(token: string): string | null {
  if (!token.startsWith(mockTokenPrefix)) return null;
  return normalizeMemberCode(token.slice(mockTokenPrefix.length));
}

export async function getPublicCard(token: string): Promise<PublicCard | null> {
  await simulateLatency();
  const code = codeFromToken(token);
  if (!code) return null;

  const member = await findMemberByCode(code);
  if (!member) return null;

  return {
    businessName: mockBusinessNames[mockBusinessId],
    fullName: member.fullName,
    code: member.code,
    tier: member.tier,
    status: member.status,
    validUntil: member.validUntil,
    googleWalletEnabled: true,
  };
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

  return { ok: true, url: `${protocol}://${host}/tarjeta/${tokenForCode(member.code)}` };
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
