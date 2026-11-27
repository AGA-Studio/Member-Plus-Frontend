"use server";

import { revalidatePath } from "next/cache";
import { removeProfilePhoto, uploadProfilePhoto } from "@/lib/api/profile-photo";
import { requireActionUser } from "@/lib/session";

export type ProfilePhotoState = {
  status: "idle" | "saved";
  error?: "noFile" | "tooLarge" | "invalid" | "storageUnavailable" | "planRequired" | "unavailable";
};

export async function uploadProfilePhotoAction(
  _previousState: ProfilePhotoState,
  formData: FormData,
): Promise<ProfilePhotoState> {
  await requireActionUser();

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { status: "idle", error: "noFile" };

  const result = await uploadProfilePhoto(file);
  if (!result.ok) return { status: "idle", error: result.reason };

  revalidatePath("/", "layout");
  return { status: "saved" };
}

export async function removeProfilePhotoAction(): Promise<boolean> {
  await requireActionUser();

  const removed = await removeProfilePhoto();
  if (removed) revalidatePath("/", "layout");

  return removed;
}
