import { backendCall } from "./backend";

export type LogoResult =
  | { ok: true }
  | { ok: false; reason: "tooLarge" | "invalid" | "storageUnavailable" | "unavailable" };

export async function uploadLogo(file: File): Promise<LogoResult> {
  const body = new FormData();
  body.set("file", file);

  const result = await backendCall<unknown>("POST", "/logo/update", { body });
  if (result.ok) return { ok: true };
  if (result.code === "image_too_large") return { ok: false, reason: "tooLarge" };
  if (result.code === "image_invalid") return { ok: false, reason: "invalid" };
  if (result.code === "storage_unavailable") return { ok: false, reason: "storageUnavailable" };

  return { ok: false, reason: "unavailable" };
}

export async function removeLogo(): Promise<boolean> {
  const result = await backendCall<unknown>("POST", "/logo/delete");

  return result.ok;
}
