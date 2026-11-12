"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/api/auth";
import { createSession } from "@/lib/session";

export type LoginState = {
  username: string;
  fieldErrors: {
    username?: "usernameRequired";
    password?: "passwordRequired";
  };
  formError?: "invalidCredentials" | "unavailable";
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!username) fieldErrors.username = "usernameRequired";
  if (!password) fieldErrors.password = "passwordRequired";

  if (fieldErrors.username || fieldErrors.password) {
    return { username, fieldErrors };
  }

  const result = await signIn(username, password);

  if (!result.ok) {
    return { username, fieldErrors: {}, formError: result.reason };
  }

  await createSession(result.accessToken);
  redirect("/caja");
}
