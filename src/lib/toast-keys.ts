export const toastKeys = [
  "signedIn",
  "signedOut",
  "membershipCreated",
  "purchaseRegistered",
  "customerUpdated",
  "membershipCancelled",
  "levelSaved",
] as const;

export type ToastKey = (typeof toastKeys)[number];

export function isToastKey(value: string | null): value is ToastKey {
  return toastKeys.some((key) => key === value);
}
