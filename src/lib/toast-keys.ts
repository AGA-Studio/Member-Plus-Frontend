export const toastTones = {
  signedIn: "success",
  signedOut: "success",
  membershipCreated: "success",
  membershipCreatedSent: "success",
  membershipCreatedPending: "info",
  membershipCreatedEmailFailed: "info",
  purchaseRegistered: "success",
  customerUpdated: "success",
  membershipCancelled: "success",
  levelSaved: "success",
  sessionExpired: "info",
  noAccess: "info",
} as const;

export type ToastKey = keyof typeof toastTones;

export function isToastKey(value: string | null): value is ToastKey {
  return value !== null && Object.hasOwn(toastTones, value);
}
