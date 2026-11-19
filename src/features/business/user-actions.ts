"use server";

import { revalidatePath } from "next/cache";
import { createUser, updateUser, type BusinessUserRole, type UserWriteFailure } from "@/lib/api/users";
import { requireActionUser } from "@/lib/session";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;
const passwordMaxLength = 128;

export type UserFormErrors = {
  name?: "nameRequired" | "nameInvalid";
  email?: "emailInvalid" | "emailTaken";
  password?: "passwordRequired" | "passwordInvalid";
  form?: "unavailable" | "notFound";
};

export type NewUserState = {
  status: "idle" | "created";
  values: { name: string; email: string; role: string };
  errors: UserFormErrors;
};

export type EditUserState = {
  status: "idle" | "saved";
  values: { name: string; email: string };
  errors: UserFormErrors;
};

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function toFieldErrors(reason: UserWriteFailure): UserFormErrors {
  switch (reason) {
    case "emailTaken":
      return { email: "emailTaken" };
    case "emailInvalid":
      return { email: "emailInvalid" };
    case "nameInvalid":
      return { name: "nameInvalid" };
    case "passwordInvalid":
      return { password: "passwordInvalid" };
    case "notFound":
      return { form: "notFound" };
    default:
      return { form: "unavailable" };
  }
}

function readRole(value: string): BusinessUserRole {
  return value === "admin" ? "admin" : "employee";
}

function passwordProblem(password: string): UserFormErrors["password"] {
  if (password.length < passwordMinLength || password.length > passwordMaxLength) return "passwordInvalid";

  return undefined;
}

export async function createUserAction(_previousState: NewUserState, formData: FormData): Promise<NewUserState> {
  await requireActionUser(["admin"]);

  const values = {
    name: readText(formData, "name"),
    email: readText(formData, "email"),
    role: readText(formData, "role"),
  };
  const password = readText(formData, "password");
  const name = values.name.split(/\s+/).filter(Boolean).join(" ");
  const errors: UserFormErrors = {};

  if (!name) errors.name = "nameRequired";
  if (!emailPattern.test(values.email.trim())) errors.email = "emailInvalid";
  if (!password) errors.password = "passwordRequired";
  else {
    const problem = passwordProblem(password);
    if (problem) errors.password = problem;
  }
  if (errors.name || errors.email || errors.password) return { status: "idle", values, errors };

  const result = await createUser({ name, email: values.email.trim(), password, role: readRole(values.role) });
  if (!result.ok) return { status: "idle", values, errors: toFieldErrors(result.reason) };

  revalidatePath("/", "layout");
  return { status: "created", values: { name: "", email: "", role: values.role }, errors: {} };
}

export async function updateUserAction(
  id: number,
  _previousState: EditUserState,
  formData: FormData,
): Promise<EditUserState> {
  await requireActionUser(["admin"]);

  const values = { name: readText(formData, "name"), email: readText(formData, "email") };
  const password = readText(formData, "password");
  const name = values.name.split(/\s+/).filter(Boolean).join(" ");
  const errors: UserFormErrors = {};

  if (!name) errors.name = "nameRequired";
  if (!emailPattern.test(values.email.trim())) errors.email = "emailInvalid";
  if (password) {
    const problem = passwordProblem(password);
    if (problem) errors.password = problem;
  }
  if (errors.name || errors.email || errors.password) return { status: "idle", values, errors };

  const result = await updateUser(id, { name, email: values.email.trim(), password });
  if (!result.ok) return { status: "idle", values, errors: toFieldErrors(result.reason) };

  revalidatePath("/", "layout");
  return { status: "saved", values: { name, email: values.email.trim() }, errors: {} };
}

export type SetUserActiveResult = { ok: true } | { ok: false; reason: "cannotDeactivateSelf" | "failed" };

export async function setUserActiveAction(id: number, isActive: boolean): Promise<SetUserActiveResult> {
  await requireActionUser(["admin"]);

  const result = await updateUser(id, { isActive });
  if (result.ok) {
    revalidatePath("/", "layout");
    return { ok: true };
  }

  return { ok: false, reason: result.reason === "cannotDeactivateSelf" ? "cannotDeactivateSelf" : "failed" };
}
