import type { SessionUser } from "@/lib/domain";
import { demoAccounts } from "./mock/demo-credentials";

export async function getUserByToken(accessToken: string | undefined): Promise<SessionUser | null> {
  const account = demoAccounts.find((item) => item.accessToken === accessToken);

  return account?.user ?? null;
}
