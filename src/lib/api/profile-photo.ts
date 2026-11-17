import { backendCall } from "./backend";

export type ProfilePhotoResult =
  | { ok: true }
  | { ok: false; reason: "tooLarge" | "invalid" | "storageUnavailable" | "unavailable" };

export async function uploadProfilePhoto(file: File): Promise<ProfilePhotoResult> {
  const body = new FormData();
  body.set("file", file);

  const result = await backendCall<unknown>("POST", "/user/photo/update", { body });
  if (result.ok) return { ok: true };
  if (result.code === "image_too_large") return { ok: false, reason: "tooLarge" };
  if (result.code === "image_invalid") return { ok: false, reason: "invalid" };
  if (result.code === "storage_unavailable") return { ok: false, reason: "storageUnavailable" };

  return { ok: false, reason: "unavailable" };
}

export async function removeProfilePhoto(): Promise<boolean> {
  const result = await backendCall<unknown>("POST", "/user/photo/delete");

  return result.ok;
}
