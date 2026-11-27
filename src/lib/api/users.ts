import { backendCall, backendGet, fieldFromValidationError } from "./backend";

export type BusinessUserRole = "admin" | "employee";

export type BusinessUser = {
  id: number;
  name: string;
  email: string;
  role: BusinessUserRole;
  isActive: boolean;
  createdAt: string;
  photoUrl: string | null;
};

type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: BusinessUserRole | "platform";
  is_active: boolean;
  created_at: string;
  photo_url?: string | null;
};

function toUser(user: BackendUser & { role: BusinessUserRole }): BusinessUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    photoUrl: user.photo_url ?? null,
  };
}

export async function listUsers(): Promise<BusinessUser[]> {
  const users = await backendGet<BackendUser[]>("/user/list");

  return users
    .filter((user): user is BackendUser & { role: BusinessUserRole } => user.role !== "platform")
    .map(toUser)
    .sort((first, second) => Number(second.isActive) - Number(first.isActive) || first.name.localeCompare(second.name));
}

export type UserWriteFailure =
  | "emailTaken"
  | "nameInvalid"
  | "emailInvalid"
  | "passwordInvalid"
  | "cannotDeactivateSelf"
  | "limitReached"
  | "notFound"
  | "unavailable";

export type UserWriteResult = { ok: true } | { ok: false; reason: UserWriteFailure };

function toFailure(status: number, code: string | null, detail: unknown, isDeactivation: boolean): UserWriteFailure {
  if (code === "email_taken") return "emailTaken";
  if (code === "limit_reached") return "limitReached";
  if (status === 404) return "notFound";
  if (status === 400 && isDeactivation) return "cannotDeactivateSelf";
  if (status === 422) {
    const field = fieldFromValidationError(detail);
    if (field === "name") return "nameInvalid";
    if (field === "email") return "emailInvalid";
    if (field === "password") return "passwordInvalid";
  }

  return "unavailable";
}

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: BusinessUserRole;
};

export async function createUser(input: CreateUserInput): Promise<UserWriteResult> {
  const result = await backendCall<unknown>("POST", "/user/create", {
    body: { name: input.name, email: input.email, password: input.password, role: input.role },
  });
  if (result.ok) return { ok: true };

  return { ok: false, reason: toFailure(result.status, result.code, result.detail, false) };
}

type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
};

export async function updateUser(id: number, input: UpdateUserInput): Promise<UserWriteResult> {
  const result = await backendCall<unknown>("PATCH", `/user/${id}/update`, {
    body: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.password ? { password: input.password } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
    },
  });
  if (result.ok) return { ok: true };

  return { ok: false, reason: toFailure(result.status, result.code, result.detail, input.isActive === false) };
}
