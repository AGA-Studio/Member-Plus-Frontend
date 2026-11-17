import { backendCall } from "./backend";

export type MemberPhotoResult =
  | { ok: true }
  | { ok: false; reason: "tooLarge" | "invalid" | "storageUnavailable" | "cancelled" | "unavailable" };

export async function uploadMemberPhoto(id: number, file: File): Promise<MemberPhotoResult> {
  const body = new FormData();
  body.set("file", file);

  const result = await backendCall<unknown>("POST", `/customer/${id}/photo/update`, { body });
  if (result.ok) return { ok: true };
  if (result.code === "image_too_large") return { ok: false, reason: "tooLarge" };
  if (result.code === "image_invalid") return { ok: false, reason: "invalid" };
  if (result.code === "storage_unavailable") return { ok: false, reason: "storageUnavailable" };
  if (result.code === "customer_cancelled") return { ok: false, reason: "cancelled" };

  return { ok: false, reason: "unavailable" };
}

export async function removeMemberPhoto(id: number): Promise<boolean> {
  const result = await backendCall<unknown>("POST", `/customer/${id}/photo/delete`);

  return result.ok;
}
