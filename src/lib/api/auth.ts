import type { UserRole } from "@/lib/domain";
import { demoAccounts } from "./mock/demo-credentials";
import { simulateLatency } from "./mock/latency";

export type SignInResult =
  | { ok: true; accessToken: string; role: UserRole }
  | { ok: false; reason: "invalidCredentials" | "unavailable" };

export async function signIn(username: string, password: string): Promise<SignInResult> {
  await simulateLatency(150);
  const account = demoAccounts.find(
    (item) => item.username === username.toLowerCase() && item.password === password,
  );

  if (!account) return { ok: false, reason: "invalidCredentials" };

  return { ok: true, accessToken: account.accessToken, role: account.role };
}
