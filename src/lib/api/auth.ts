import { demoCredentials } from "./mock/demo-credentials";

export type SignInResult =
  | { ok: true; accessToken: string }
  | { ok: false; reason: "invalidCredentials" | "unavailable" };

export async function signIn(username: string, password: string): Promise<SignInResult> {
  const matches =
    username.toLowerCase() === demoCredentials.username &&
    password === demoCredentials.password;

  if (!matches) {
    return { ok: false, reason: "invalidCredentials" };
  }

  return { ok: true, accessToken: demoCredentials.accessToken };
}
