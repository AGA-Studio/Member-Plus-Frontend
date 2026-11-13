"use server";

import { getGoogleWalletUrl } from "@/lib/api/card-delivery";

export type GoogleWalletState = { ok: true; url: string } | { ok: false };

export async function googleWalletAction(token: string): Promise<GoogleWalletState> {
  const result = await getGoogleWalletUrl(token);

  return result.ok ? { ok: true, url: result.url } : { ok: false };
}
